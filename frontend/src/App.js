import React, {Component} from 'react';

import { Button, Container, Row, Col } from 'reactstrap';

import ListNotes from './components/ListNotes';
import AddNoteForm from './components/AddNoteForm';
import EditNoteForm from './components/EditNoteForm';
import { fetchNotes, fetchNote, updateNote, addNote } from './api';
import Websocket from 'react-websocket';

class App extends Component {
  state = {
    notes: [],
    note: {},
    current_note_id: 0,
    is_creating: true,
    is_fetching: true
  }

  componentDidMount() {
    this.getData();
  }

  async getData(){
    let data = await fetchNotes();
    this.setState({notes: data, is_fetching: false});
  }

  async handleItemClick(id) {
    let selected_note = await fetchNote(id);

    this.setState((prevState) => {
      return {
        is_creating: false, 
        current_note_id: id,
        note: selected_note
      }
    })
  }

  handleAddNote = () => {
    this.setState((prevState) => {
      return {is_creating: true}
    })
  }

  handleSaveNote = (data) => {
    addNote(data);
    this.getData();
  }

  handleData(data) {
    let result = JSON.parse(data);

    let current_note = this.state.note;
    if(current_note.id === result.id) {
      this.setState({note: result});
    }
  }

  handleOnChange(e) {
    let content = e.target.value;
    let current_note = this.state.note;
    current_note.content = content;

    this.setState({
      note: current_note
    });

    const socket = this.refs.socket;
    socket.state.ws.send(JSON.stringify(current_note));
  }


  render(){
    return (
      <>
        <Container>
          <Row>
            <Col xs="10">
              <h2>Realtime notes</h2>
            </Col>
            <Col xs="2">
              <Button color="primary" onClick={this.handleAddNote}>Create a new note</Button>
            </Col>
          </Row>
          <Row>
            <Col xs="4">
              {
                this.state.is_fetching ?
                "Loading..." :
                <ListNotes notes={this.state.notes} handleItemClick={(id) => this.handleItemClick(id)} />
              }            </Col>
            <Col xs="8">
              {
                this.state.is_creating ? 
                <AddNoteForm handleSave={this.handleSaveNote} />:
                <EditNoteForm handleChange={this.handleChange} note={this.state.note} />
              }
              <Websocket ref="socket" url="ws://127.0.0.1:8000/ws/notes"
                onMessage={this.handleData}
              />
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default App;
