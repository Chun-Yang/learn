import './App.css'
import { Route, Switch, Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import Home from './pages/Home'
import Addition from './pages/Addition'
import AdditionExercise from './pages/AdditionExercise'

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="App">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/addition" component={Addition} />
          <Route path="/addition-exercise/:digits/:count" component={AdditionExercise} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
