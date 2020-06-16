import React, { Component } from "react";
import axios from 'axios';
import Joke from './Joke';
import { uuid } from 'uuidv4';
import "../JokesList.css";
import "../App.css";

class JokesList extends Component {
    static defaultProps = {
        maxJokes: 10    
    };

    constructor(props) {
        super(props);

        this.state = { 
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]") ,
            loading: false
        };
        this.seenJokes = new Set(this.state.jokes.map(joke => joke.text));
        this.getJokes = this.getJokes.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleVotes(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(joke => 
                joke.id === id ? {...joke, votes: joke.votes + delta} : joke)
        }), 
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }

    componentDidMount() {
        if(this.state.jokes.length === 0) this.getJokes();
     }

    async getJokes() {
     try {  
        let jokes = [];

        while(jokes.length < this.props.maxJokes) {
        const response = await axios.get("https://icanhazdadjoke.com/", {
            headers: {
                Accept: "application/json"
            }
        });

        let newJoke = response.data.joke
        if(!this.seenJokes.has(newJoke)) jokes.push({id: uuid(), text: response.data.joke, votes: 0});
        
        }
        this.setState(st => ({
            jokes: [...st.jokes, ...jokes],
            loading: false
        }), 
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );

    } catch(err) {
            alert(err);
            this.setState({ loading: false })
        }
    }

    handleClick() {
        this.setState({ loading: true }, this.getJokes)
        this.getJokes()
    }

    render() {
        if(this.state.loading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin">
                    </i>
                    <h1 className="JokeList-title">Fetching funnies...</h1>
                </div>
            )
        }

        let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);
        return (
            <div className="JokesList">
               <div className="JokeList-sidebar">
                <h1 className="JokeList-title"><span>Dad</span> Jokes</h1>
                <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
                <button className="JokeList-getmore" onClick={this.handleClick}><span className="JokeList-fetch">Fetch</span> <span className="JokeList-jokesTxt">Jokes</span></button>
                </div> 
                <div className="JokeList-jokes">
                {jokes.map(joke => (
                    <Joke 
                        votes={joke.votes} 
                        text={joke.text} 
                        upvote={() => this.handleVotes(joke.id, 1)} 
                        downvote={() => this.handleVotes(joke.id, -1)} 
                    />
                ))}
                </div>
            </div>
        );
    }   
}

export default JokesList;