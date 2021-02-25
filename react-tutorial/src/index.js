import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button 
        className="square" style={props.isWinning ? {background:"#ff5c5c"} : {}}
        onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
  
  class Board extends React.Component {

    renderSquare(i) {
      let isWinning = false;
      if (this.props.winningSquares) {
        isWinning = this.props.winningSquares.includes(i);
      }
      return (
      <Square 
        value={this.props.squares[i]} isWinning={isWinning}
        onClick={() => this.props.onClick(i)}/>
      );
    }

  
    render() {
      var rows = [];
      for (var i=0; i < 3; i++) {
        rows.push(<div className="board-row" key={i}>{this.renderSquare(i*3 + 0)}{this.renderSquare(i*3 + 1)}{this.renderSquare(i*3 + 2)}</div>)
      }
      return (
        <div>{rows}</div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null),
        }],
        stepNumber: 0,
        xIsNext: true,
      }
    }

    handleClick(i) {
      const history = this.state.history.slice(0,this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X':'O';
      this.setState({ 
        history: history.concat([{
          squares: squares,
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
        selectedButton: null,
    });
    }

    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
        selectedButton : step,
      });
    }


    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = calculateWinner(current.squares);

      const moves = history.map((step,move) => {
        const desc = move ? 'Go to move #' + move : 'Go to game start';
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)} style={move === this.state.selectedButton ? {fontWeight:"Bold"} : {}}>{desc}</button>
          </li>
        );
      });

      
      let status;
      let winningSquares;
      if (winner) {
        status = 'Winner: ' + winner[0];
        winningSquares = winner[1];
      } else if (this.state.stepNumber === 9) {
        status = 'No winner: Draw';
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
      return (
        <div className="game">
          <div className="game-board">
            <Board squares={current.squares} winningSquares={winningSquares}
            onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [squares[a],[a,b,c]];
      }
    }
    return null;
  }

