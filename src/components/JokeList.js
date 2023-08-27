import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends Component { 
  
  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    };
  }

  // Fetch jokes initially if joke list is empty

  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }

  // Fetch jokes again if joke list becomes empty after an update
  componentDidUpdate(prevProps, prevState) {
    if (this.state.jokes.length === 0 && prevState.jokes.length !== 0) {
      this.getJokes();
    }
  }

  // Asynchronous function to fetch jokes and update the state
  async getJokes() {
    let j = [...this.state.jokes];
    let seenJokes = new Set();
    try {
      while (j.length < (this.props.numJokesToGet || 10)) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0 });
        } else {
          console.error("duplicate found!");
        }
      }
      this.setState({ jokes: j });
    } catch (e) {
      console.log(e);
    }
  }

  // Clears the joke list which will trigger a new joke fetch
  generateNewJokes = () => {
    this.setState({ jokes: [] });
  }

  // Update the vote count for a specific joke by a given delta
  vote = (id, delta) => {
    this.setState(prevState => ({
      jokes: prevState.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
    }));
  }

  // Render sorted jokes or nothing if no jokes present
  render() {
    if (this.state.jokes.length) {
      let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={this.generateNewJokes}>
            Get New Jokes
          </button>

          {sortedJokes.map(j => (
            <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
          ))}
        </div>
      );
    }

    return null;
  }
}

export default JokeList;
