# redux-check-task

A redux state manager for async tasks and checks. A **task** is a unit of async work that should only be run under certain conditions or in certains ways. A **check** is two tasks, one for the work and one to check if the work should done. Provides reducers and action creators to handle task state and to dispatch task or check actions.

### Prerequisites
 - [redux](https://github.com/reactjs/redux)
 - [redux-thunk](https://github.com/gaearon/redux-thunk)

### Installing
```
npm i redux-check-test -S
```

### Running the tests
```
npm run test
```

### Usage
##### create a task reducer
```javascript
import { createTaskReducer } from 'redux-check-task'
const reducers = {
    myWork: createTaskReducer('myWork')
}
```
 > note: A '.' delimited state key must be supplied to the task reducer creator. This is used to find the task in a nested state and to ensure this is the only task that responds to it's action (i.e. - app.myReducer.myWork)
 
##### create a check reducer
```javascript
import { createCheckReducer } from 'redux-check-task'
const reducers = {
    myWork: createCheckReducer('myWork')
}
```
 > note: A '.' delimited state key must be supplied to the check reducer creator. This is used to find the check in a nested state and to ensure this is the only check that responds to it's action (i.e. - app.myReducer.myWork)

##### create a store with [redux-thunk](https://github.com/gaearon/redux-thunk)
```javascript
import {
    createStore,
    combineReducers,
    applyMiddleware
} from 'redux'

import thunk from 'redux-thunk'

const {
    dispatch
} = createStore(
    combineReducers(reducers),
    applyMiddleware(thunk)
)
```

##### create and dispatch a task action
```javascript
dispatch(createTaskAction({
    stateKey: 'myWork',
    task: (dispatch, getState) => Promise.resolve({ some: 'data' })
}))
```
 - `createTaskAction` is an action creator that needs two things:
 - `stateKey` - the '.' delimited key that indicates how to find the task in state
    - `task` - a *function* that receives `dispatch` and `getState` from [redux-thunk](https://github.com/gaearon/redux-thunk) and **must** return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves the results of the task
    - *options*
        - `onlyOnce` - bool indicating whether to perform the task more than one time (defaults to false)

##### create and dispatch a check action
```javascript
dispatch(createCheckAction({
    stateKey: 'myWork',
    check: (dispatch, getState) => Promise.resolve(true),
    task: (dispatch, getState) => Promise.resolve({ some: 'data' }),
}))
```
 - `createTaskAction` is an action creator that needs three things:
    - `stateKey` - the '.' delimited key that indeicates how to find the check in state
    - `check` - a *function* that receives `dispatch` and `getState` from [redux-thunk](https://github.com/gaearon/redux-thunk) and **must** return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves a bool indicating whether to perform the task
    - `task` - a *function* that receives `dispatch` and `getState` from [redux-thunk](https://github.com/gaearon/redux-thunk) and **must** return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves the results of the task
    - *options*
        - `checkOnlyOnce` - bool indicating whether to perform the check more than one time (defaults to false)
        - `autoPerformTask` - bool indicating whether to automatically perform the task if the check resolves true (defaults to true)
        - `taskOnlyOnce` - bool indicating whether to perform the task more than one time (defaults to false)

##### task/check state
task state
```javascript
{
    ...state,
    myWork: {
        stateKey, // string containing the state key used to dispatch this task (will be 'myWork' in this case)
        meta: {
            performing, // bool indicating whether the task is currently in progress
            complete, // bool indicating whether the task is finished
            timing: {
                started: // Date instance containing when the task was executed
                duration: // number containing how long the task took in ms
            }
        },
        results // the value resolved by the task
    }
}
```
check state
```javascript
{
    ...state,
    myWork: {
        // both will be task reducers with state matching the above task structure
        check, 
        task
    }
}
```

##### accessing task results
handle the complete action in a reducer
```javascript
import {
    createStore,
    combineReducers,
    applyMiddleware
} from 'redux'

import thunk from 'redux-thunk'

const { createTaskReducer } from 'redux-check-task'
const reducers = {
    app: {
        myWork: createTaskReducer('app.myWork'),
        workReducer: (state, {
            type,
            performance
        }) => {
            // the action type will be `${stateKey}-${taskActionType}` 
            // - taskActionType's are 'performing' and 'complete'
            switch (type) {
                case 'app.myWork-performing':
                    return {
                        ... // update state based on myWork starting
                    }
                case 'app.myWork-complete':
                    const {
                        results // will be { some: 'data' }
                    } = performance
                    return {
                        ... // update state based on myWork results
                    }
                default:
                    return state
            }
        }
    }
}
const {
    dispatch
} = createStore(
    combineReducers(reducers),
    applyMiddleware(thunk)
)
dispatch(createTaskAction({
    stateKey: 'myWork',
    task: (dispatch, getState) => Promise.resolve({ some: 'data' })
}))
```
**--- or ---**

once a task or check action is dispatched it will return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) with results of the run:
```javascript
dispatch(createTaskAction({
    stateKey: 'myWork',
    task: (dispatch, getState) => Promise.resolve({ some: 'data' })
})).then(({
    stateKey, // string containing the state key used to dispatch this task
    onlyOnce, // bool indicating whether the task will be executed more than once,
    alreadyPerformed, // bool indicating whether the task was executed by a previous dispatch,
    performance: { // if a task is configured to only run one time and it has already been executed, the performance property will be undefined
        timing: {
            started: Date instance containing when the task was executed
            duration: number containing how long the task took in ms
        },
        results // the value resolved by the task - will be { some: 'data' }
    }
}) => {})
```

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

