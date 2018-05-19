import React, { Component } from 'react';

import '../css/Chatbot.css';

class Chatbot extends Component {
  constructor(props) {
      super(props)
      this.state = {
    show: false,
    listening: false,
    text: "제대로 말해봐.",
  };
this.start=this.start.bind(this);
this.end=this.end.bind(this);
this.handleClose=this.handleClose.bind(this);
}

start(){
  this.recognition.start();
};

end(){
  this.recognition.stop();
};

handleClose(){
  this.setState({ show: false });
};

  componentDidMount() {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      alert(
        '크롬브라우저로 다시 시도하세요.'
      );
      return;
    }

    this.recognition = new Recognition();
    this.recognition.lang = process.env.REACT_APP_LANGUAGE || 'ko-KR';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = event => {
      const text = event.results[0][0].transcript;

      console.log('transcript', text);
      this.setState({ text });
    };

    this.recognition.onspeechend = () => {
      console.log('stopped');

      this.setState({ show: true });
    };

    this.recognition.onnomatch = event => {
      console.log('no match');
      this.setState({ text: "또박또박!" });
    };

    this.recognition.onstart = () => {
      this.setState({
        listening: true,
      });
    };

    this.recognition.onend = () => {
      console.log('end');

      this.setState({
        listening: false,
      });

      this.end();
    };

    this.recognition.onerror = event => {
      console.log('error', event);

      this.setState({
        show: true,
        text: event.error,
      });
    };
  }

  render() {
    return (
      <main className="demo-1">
        {this.state.show ? (
          <div>
          <p>{this.state.text}</p>
          <button onClick={this.handleClose}>BACK</button>
          </div>
        ) : ( <div>
          <button onClick={this.start}>onStart</button>
          <button onClick={this.end}>onEnd</button>
          {this.state.listening ? <p>Listening...</p> : <p></p>
                }
        </div>)}
      </main>
    );
  }
}

export default Chatbot;
