# redux-check-task

A redux state manager for async tasks and check tasks. A **task** is a unit of async work that should only be run under certain conditions or in certains ways. A **check** is two tasks, one for the work and one to check if the work should be done. Provides reducers and action creators to handle state and dispatch task or check performances.

## Getting Started

#### Prerequisites
 - [redux](https://github.com/reactjs/redux)
 - [redux-thunk](https://github.com/gaearon/redux-thunk)

#### Installing
```
npm i redux-check-test -S
```

#### Running the tests
```
npm run test
```

#### Usage
##### create a task reducer
```
import { createTaskReducer } from 'redux-check-task'
const reducers = {
    myWork: createTaskReducer('myWork')
}
```
 > note: A '.' delimited state key must be supplied to the task reducer creator. This is used to find the task in a nested state and to ensure this is the only task that responds to it's action (i.e. - app.myReducer.myWork)
 
##### create a check reducer
```
import { createCheckReducer } from 'redux-check-task'
const reducers = {
    myWork: createCheckReducer('myWork')
}
```
 > note: A '.' delimited state key must be supplied to the check reducer creator. This is used to find the check in a nested state and to ensure this is the only check that responds to it's action (i.e. - app.myReducer.myWork)

##### create a store with [redux-thunk](https://github.com/gaearon/redux-thunk)
```
const store = createStore(
    combineReducers(reducers),
    applyMiddleware(thunk)
)
```

##### create and dispatch a task action
```
dispatch(createTaskAction({
    stateKey: 'myWork',
    task: (dispatch, getState) => Promise.resolve({ some: 'data' })
}))
```
 - `createTaskAction` is an action creator that needs two things:
    - `stateKey` - the '.' delimited key that indeicates how to find the task in state
    - `task` - a *function* that receives `dispatch` and `getState` from [redux-thunk](https://github.com/gaearon/redux-thunk) and **must** return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves the results of the task
    - *options*
        - `onlyOnce[bool]` - only perform the task one time (*defaults to false*)

##### create and dispatch a check action
```
dispatch(createCheckAction({
    stateKey: 'myWork',
    check: (dispatch, getTaskState) => Promise.resolve(true),
    task: (dispatch, getTaskState) => Promise.resolve({ some: 'data' }),
}))
```
 - `createTaskAction` is an action creator that needs three things:
    - `stateKey` - the '.' delimited key that indeicates how to find the check in state
    - `check` - a *function* that receives `dispatch` and `getState` from [redux-thunk](https://github.com/gaearon/redux-thunk) and **must** return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves a bool indicating whether to perform the task
    - `task` - a *function* that receives `dispatch` and `getState` from [redux-thunk](https://github.com/gaearon/redux-thunk) and **must** return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves the results of the task
    - *options*
        - `checkOnlyOnce[bool]` - only perform the check one time (*defaults to false*)
        - `autoPerformTask[bool]` - automatically perform the task if the check is performed and resolves true (*defaults to true*)
        - `taskOnlyOnce[bool]` - only perform the task one time (*defaults to false*)

#### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

