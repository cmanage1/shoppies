import React from 'react';
import { 
  Page, 
  DisplayText, 
  Subheading, 
  Button,
  TextStyle,
  TextField,
}
from '@shopify/polaris';
import styles from './App.module.css';
import defaultMoviePNG from './assets/default-movie.png'

class App extends React.Component{
  constructor(props){
    super()
    this.state = {
      title: '',
      results: [],
      nominations: [],
    }
  }

  componentDidMount(){
    if (localStorage.getItem("nominationsArray") !== []) {
      this.setState({
        nominations: JSON.parse(localStorage.getItem("nominationsArray")),
      })
    }
  }

  search = () => {
    const BASE_URL = 'http://www.omdbapi.com/';
    const apiKey = '&apikey=' + process.env.REACT_APP_API_KEY;
    const titlefield = "?s=" + this.state.title;

    fetch(BASE_URL + titlefield + apiKey, { method: "GET" })
      .then(res => res.json())
      .then((data) => {
        this.setState({ results: data.Search});
      }).catch((e) => {
        console.error(e)
      })
  }

  foundDuplicate = (movieID) => {
    for (var i = 0; i < this.state.nominations.length; i++) {
      if (this.state.nominations[i].imdbID === movieID) {
        return true
      }
    }
    return false; 
  }

  nominate = (movie) => {
    if ( this.state.nominations.length >= 5) return 

    this.setState({ nominations: this.state.nominations.concat(movie) }, 
      () => localStorage.setItem("nominationsArray", JSON.stringify(this.state.nominations)) //save to localstorage
    )
  }

  remove = (movieID) => {
    for (var i=0; i < this.state.nominations.length ; i++ ){
      if ( this.state.nominations[i].imdbID === movieID){
        var array = [ ...this.state.nominations]
        array.splice( i, 1)
        this.setState({ 
          nominations: array,
        }, () => localStorage.setItem("nominationsArray", JSON.stringify(this.state.nominations)) //save to localstorage
      )}
    } 
  }

  render(){
    return(
      <Page> 
        <div>
          <DisplayText size="extraLarge" element="h1" > The Shoppies </DisplayText>
          <Subheading> Movie Awards for Entrepreneurs </Subheading>

          <div className={ styles.currentNominations}>
            <TextStyle variation="strong" element="h5" > Your current nominations:  {this.state.nominations.length} / 5</TextStyle>
            <div>
              {
                (this.state.nominations.length !== 0 ) ?
                  this.state.nominations.map(nomination => 
                    <div 
                      key={nomination.imdbID} 
                      className={styles.nominationCards}
                    >
                      {(nomination.Poster === "N/A") ? 
                        <img
                          src={defaultMoviePNG}
                          alt={nomination.Title}
                        />
                        : <img
                          style={{ width: "67%" }}
                          src={nomination.Poster}
                          alt={nomination.Title}
                        />
                      }

                      <h4> {nomination.Title} </h4>
                      <Button onClick={(e) => this.remove(nomination.imdbID, e)}>
                        Remove
                      </Button>
                      </div>
                  )
                :
                  <TextStyle> You have not nominated anything yet</TextStyle>
              }
            </div>
          </div>
          <TextField 
            type="text" 
            id="title" 
            placeholder= "Avengers Endgame"
            value= {this.state.title}
            onChange={  (newValue) => this.setState({title: newValue})}
            onKeyPress = { (e) => {
              if ( e.key === "Enter"){
                e.preventDefault();
                this.search();
              }
            }}
          />
          <Button
            primary
            onClick={(e) => this.search(e)} 
            disabled={ this.state.title === undefined}> 
            Search 
          </Button>
        </div>

        <div >
          {
            ( this.state.results && this.state.results.length !== 0) ?
              this.state.results.map(movie =>
                <div
                  key={movie.imdbID} 
                  className ={ styles.resultCards}
                  >
                  { (movie.Poster === "N/A") ?
                    
                    <img
                      src={defaultMoviePNG}
                      alt={movie.Title}
                    />
                    : 
                    <img
                      style={{ width: "67%" }}
                      src={movie.Poster}
                      alt={movie.Title}
                    />
                  }
                  <h4> {movie.Title}
                  </h4>
                  <Button
                    onClick={(e) => this.nominate(movie, e)}
                    disabled={this.foundDuplicate(movie.imdbID) ||  ( this.state.nominations.length >= 5)}
                  >
                    Nominate
                  </Button>
                </div>
              )
            : null
          }
        </div>
      </Page>
    );
  }
}

export default App;
