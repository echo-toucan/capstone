import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
  updateShapes,
  updateBoard,
  movedLeft,
  movedRight,
  rotated,
  changePhase,
  clearRows,
  updateCurrent,
  gameOver,
  setGridTimer,
  setSpawnTimer,
  updateScore,
  updateRowCount
} from '../store'
import {penalty, colors} from '../store/utility/AllShapes'

class Grid extends Component {
  constructor() {
    super()
    this.state = {
      rotationCounter: null
    }
    this.updateBoard = this.updateBoard.bind(this)
    this.spawnShapes = this.spawnShapes.bind(this)
    this.movement = this.movement.bind(this)
  }

  componentDidMount() {
    if (this.props.dropTimer) {
      clearTimeout(this.props.dropTimer)
    }
    if (this.props.spawnTimer) {
      clearTimeout(this.props.spawnTimer)
    }
    this.props.setSpawnTimer(
      setTimeout(() => {
        this.spawnShapes(this.props.currentShape)
        this.props.changePhase()
      }, 5000)
    )
    this.drop()
  }

  componentWillUnmount() {
    if (this.props.dropTimer) {
      clearTimeout(this.props.dropTimer)
    }
    if (this.props.spawnTimer) {
      clearTimeout(this.props.spawnTimer)
    }
  }

  spawnShapes() {
    const shape = this.props.currentShape.shape.shape
    if (!this.props.currentShape.achieved) {
      this.props.updateScore(-5)
    } else {
      this.props.updateScore(10)
    }
    let newRows = []
    const oldGrid = this.props.gameBoard
    for (let i = 0; i < shape.length; i++) {
      let newRow = [...oldGrid[i]]
      for (let j = 0; j < shape[i].length; j++) {
        if (oldGrid[i][j + 4] < 10) {
          newRow[j + 4] = shape[i][j]
        } else {
          this.gameEnd()
        }
      }
      newRows.push(newRow)
    }
    const newGrid = [...newRows, ...this.props.gameBoard.slice(newRows.length)]
    this.props.updateBoard(newGrid)
  }

  gameEnd() {
    this.props.gameOver()
  }

  //sets the tetris board speed
  drop() {
    this.props.setGridTimer(setInterval(this.updateBoard, 750))
  }

  //it updates the board when an active shape moves down or lands
  updateBoard() {
    const oldGrid = this.props.gameBoard
    if (this.hasCollided()) {
      this.stopDrop()
      this.deleteRows()
      const newCurrent = this.props.previewShape[0]
      this.props.updateCurrent(newCurrent)
      this.props.setSpawnTimer(
        setTimeout(() => {
          this.spawnShapes(this.props.currentShape)
          this.props.changePhase()
        }, 5000)
      )
      this.props.changePhase()
      this.props.updateShapes()
    } else {
      let newGrid = oldGrid.map((row, rowIdx) => {
        return row.map((cell, colIdx) => {
          if (cell > 10) return cell
          const cellAbove = rowIdx === 0 ? 0 : oldGrid[rowIdx - 1][colIdx]
          if (cell < 10 && cellAbove < 10) {
            return cellAbove
          } else if (cellAbove >= 10) {
            return 0
          } else return cell
        })
      })
      this.props.updateBoard(newGrid)
    }
  }

  movement(event) {
    if (event.key === 'ArrowLeft') {
      return this.props.moveLeft()
    }
    if (event.key === 'ArrowRight') {
      return this.props.moveRight()
    }
    if (event.key === 'ArrowUp') {
      const rotations = this.props.currentShape.shape.rotations
      let rotationCounter
      if (this.state.rotationCounter === null) {
        rotationCounter = 0
      } else rotationCounter = this.state.rotationCounter + 1
      this.setState({rotationCounter})
      this.props.rotate(rotations, rotationCounter)
    }
  }

  //checks if the active shape has landed
  hasCollided() {
    const grid = this.props.gameBoard
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const current = grid[row][col]
        const isFalling = current > 0 && current < 10
        const hasFloorBelow = !grid[row + 1] || grid[row + 1][col] >= 10
        if (isFalling && hasFloorBelow) {
          return true
        }
      }
    }
    return false
  }

  //changes the active shape id from falling to stationary by adding 10.
  stopDrop() {
    const oldGrid = this.props.gameBoard
    let newGrid = oldGrid.map(row => {
      return row.map(cell => {
        if (cell > 0 && cell < 10) {
          return cell + 10
        } else {
          return cell
        }
      })
    })
    this.props.updateBoard(newGrid)
  }

  deleteRows() {
    const gameBoard = this.props.gameBoard
    let rowsToRemove = []

    for (let row = 0; row < gameBoard.length; row++) {
      let rowComplete = true
      for (let col = 0; col < gameBoard[row].length; col++) {
        if (gameBoard[row][col] === 0) rowComplete = false
      }
      if (rowComplete) rowsToRemove.push(row)
    }
    let currentScore = rowsToRemove.length * 100

    this.props.updateScore(currentScore)
    let rows = rowsToRemove.length
    this.props.updateRow(rows)
    this.props.clearRows(rowsToRemove)
  }

  render() {
    const {gameBoard} = this.props
    const {score} = this.state
    return (
      <div>
        {/* <button type="button" onClick={() => this.drop()}>
          Drop!
        </button>
        <input onKeyDown={event => this.movement(event)} />
        <button type="button" onClick={() => this.spawnShapes()}>
          Spawn a shape
        </button> */}

        <table className="game-table">
          <tbody>
            {gameBoard.map((row, rowIdx) => {
              return (
                <tr key={rowIdx} className="game-row">
                  {row.map((cell, cellIdx) => {
                    return (
                      <td
                        key={cellIdx}
                        style={{backgroundColor: colors[cell % 10]}}
                        className="game-cell"
                      />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  currentShape: state.currentShape,
  gameBoard: state.gameBoard,
  previewShape: state.previewShape,
  gameStarted: state.gameState.started,
  dropTimer: state.timers.drop,
  spawnTimer: state.timers.spawn
})

const mapDispatchToProps = dispatch => ({
  updateBoard: board => dispatch(updateBoard(board)),
  updateCurrent: shape => dispatch(updateCurrent(shape)),
  updateShapes: () => dispatch(updateShapes()),
  moveLeft: () => dispatch(movedLeft()),
  moveRight: () => dispatch(movedRight()),
  rotate: (rotations, counter) => dispatch(rotated(rotations, counter)),
  changePhase: () => dispatch(changePhase()),
  clearRows: rows => dispatch(clearRows(rows)),
  gameOver: () => dispatch(gameOver()),
  setGridTimer: timeoutFn => dispatch(setGridTimer(timeoutFn)),
  setSpawnTimer: timeoutFn => dispatch(setSpawnTimer(timeoutFn)),
  updateScore: score => dispatch(updateScore(score)),
  updateRow: rows => dispatch(updateRowCount(rows))
})

export default connect(mapStateToProps, mapDispatchToProps)(Grid)
