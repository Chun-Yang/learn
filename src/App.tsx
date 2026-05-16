import './App.css'
import { Route, Switch, Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import Home from './pages/Home'
import Addition from './pages/Addition'
import AdditionExercise from './pages/AdditionExercise'
import Multiplication from './pages/Multiplication'
import MultiplicationExercise from './pages/MultiplicationExercise'

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="App">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/addition" component={Addition} />
          <Route path="/addition-exercise/:digits/:count" component={AdditionExercise} />
          <Route path="/multiplication" component={Multiplication} />
          <Route path="/multiplication-exercise/:digits/:count" component={MultiplicationExercise} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
