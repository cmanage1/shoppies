import React from 'react';
import { 
  Loading,
  Frame,
  Toast,
  Page, 
  DisplayText, 
  Subheading, 
  Button,
  TextStyle,
  TextField,
}
from '@shopify/polaris';
import styles from './App.module.css';
import defaultMoviePNG from './assets/default-movie.png';

class App extends React.Component{
  constructor(props){
    super()
    this.state = {
      title: '',
      results: [],
      nominations: [],
      nominatedToastActive: false,
      removedToastActive: false,
      loading: false,
    }
  }

  componentDidMount(){
    if (localStorage.getItem("nominationsArray") !== null) { //if there already values saved to storage, we import them
      this.setState({
        nominations: JSON.parse(localStorage.getItem("nominationsArray")),
      })
    }
  }

  search = () => {
    const BASE_URL = 'http://www.omdbapi.com/';
    const apiKey = '&apikey=' + process.env.REACT_APP_API_KEY;
    const titlefield = "?s=" + this.state.title;
    this.setState({ loading: true })

    fetch(BASE_URL + titlefield + "&plot"+ apiKey, { method: "GET" })
      .then(res => res.json())
      .then((data) => {
        this.setState({ results: data.Search});
      }).catch((e) => {
        console.error(e)
      })
    this.setState({ loading: false })
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

    this.setState({ 
      nominations: this.state.nominations.concat(movie),
      nominatedToastActive: true 
    }, 
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
          removedToastActive: true, 
        }, () => localStorage.setItem("nominationsArray", JSON.stringify(this.state.nominations))) //save to localstorage
      }
    } 
  }

  getNominatedToast = () => {
    if (this.state.nominatedToastActive){
      return (
        <div>
          <Toast content="Added to Nominations" duration="2000" onDismiss={() => this.setState({ nominatedToastActive: false })} />
        </div>
      )
    }else{
      return null
    }
  }

  getRemovedToast = () => {
    if (this.state.removedToastActive) {
      return (
        <div>
          <Toast content="Removed from Nominations" duration="2000" onDismiss={() => this.setState({ removedToastActive: false })} />
        </div>
      )
    } else {
      return null
    }
  }

  getLoadingBar = () => {
    //the loading bar doesn't appear most of the time because of the speed of the API return
    //but I included it anyways in case it does take long and the user needs to see progress
    if (this.state.loading){ 
      <Loading />
    }else return null
  }

  render(){
    var nominatedToast = this.getNominatedToast();
    var removeToast = this.getRemovedToast();
    var loadingBar = this.getLoadingBar();

    return(
      <Page> 
        <Frame>
        {loadingBar}
        <div>
          <DisplayText size="extraLarge" element="h1" > The Shoppies </DisplayText>
          <Subheading> Movie Awards for Entrepreneurs </Subheading>

          <div className={styles.nominationsContainer}> 
              <div className={styles.nominationsNumber}>
              <TextStyle variation="strong" element="h5" > 
                Your current nominations:  {this.state.nominations === null ? '0' : this.state.nominations.length} / 5 
              </TextStyle>
              </div>
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
                          style={{ width: '50%'}}
                          src={nomination.Poster}
                          alt={nomination.Title}
                        />
                      }
                      <Subheading> {nomination.Title }</Subheading>
                      <Subheading> {nomination.Year }</Subheading>
                      <Button onClick={(e) => this.remove(nomination.imdbID, e)} >
                        Remove
                      </Button>
                    </div>
                  )
                :
                <TextStyle> You have not nominated anything yet</TextStyle>
              }
          </div>
            {nominatedToast}
        </div>

        <div className={styles.searchBar}>
          <TextField
            label="Search for any movie"
            type="text"
            id="title"
            placeholder="Avengers Endgame"
            value={this.state.title}
            onChange={(newValue) => this.setState({ title: newValue })}
            style={{ paddingTop: '2rem' }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                this.search(e);
              }
            }}
          />
          <Button
            primary
            onClick={(e) => this.search(e)}
            disabled={this.state.title === undefined}>
            Search
          </Button>
        </div>

        <div>
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
                  <Subheading> {movie.Title}</Subheading>
                  <Subheading> {movie.Year}</Subheading>
                  <Button
                    onClick={(e) => this.nominate(movie, e) }
                    disabled={this.foundDuplicate(movie.imdbID) ||  ( this.state.nominations.length >= 5)}
                  >
                    Nominate
                  </Button>
                </div>
              )
            : null
          }
        </div>
          {removeToast}
        </Frame>
        <footer>
          <p> Crated by Chethin Manage. View the code on <a target="__blank" href="https://github.com/cmanage1/shoppies">GitHub</a></p>
        </footer>
      </Page>
    );
  }
}

export default App;