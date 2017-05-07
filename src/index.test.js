
import { expect } from 'chai'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import {
    createTaskReducer,
    createCheckReducer,
    createTaskAction,
    createCheckAction,
    createCheckForReducer,
    createTaskForReducer
} from './index'

describe('test', () => {
    it('should do a task', () => {
        const {
            dispatch,
            getState
        } = createStore(
            combineReducers({
                aTask: createTaskReducer('aTask'),
                aCheck: createCheckReducer('aCheck')
            }),
            applyMiddleware(thunk)
        )
        return dispatch(createTaskAction({
            stateKey: 'aTask',
            task: (dispatch, getState) => 
                new Promise(resolve => setTimeout(() => resolve({
                    some: 'data'
                }), 0))
        })).then(() => {
            const {
                aTask: {
                    stateKey,
                    meta: {
                        performing,
                        complete,
                        timing: {
                            started,
                            duration
                        }
                    },
                    results: {
                        some
                    }
                }
            } = getState()
            expect(stateKey).to.be.equal('aTask')
            expect(performing).to.be.false
            expect(complete).to.be.true
            expect(started).to.be.a('date')
            expect(duration).to.be.a('number')
            expect(some).to.be.equal('data')
        })
    })
    it('should do the task if check resolves true', () => {
        const {
            dispatch,
            getState
        } = createStore(
            combineReducers({
                aTask: createTaskReducer('aTask'),
                aCheck: createCheckReducer('aCheck')
            }),
            applyMiddleware(thunk)
        )
        return dispatch(createCheckAction({
            stateKey: 'aCheck',
            check: (dispatch, getTaskState) =>
                new Promise(resolve => setTimeout(() => resolve(true), 0)),
            task: (dispatch, getTaskState) => 
                new Promise(resolve => setTimeout(() => resolve({
                    some: 'data'
                }), 0)),
        })).then(() => {
            const {
                aCheck: {
                    task: {
                        results: {
                            some
                        }
                    }
                }
            } = getState()
            expect(some).to.be.equal('data')
        })
    })
    it('should do the task if check resolves false', () => {
        const {
            dispatch,
            getState
        } = createStore(
            combineReducers({
                aTask: createTaskReducer('aTask'),
                aCheck: createCheckReducer('aCheck')
            }),
            applyMiddleware(thunk)
        )
        return dispatch(createCheckAction({
            stateKey: 'aCheck',
            check: (dispatch, getTaskState) =>
                new Promise(resolve => setTimeout(() => resolve(false), 0)),
            task: (dispatch, getTaskState) => 
                new Promise(resolve => setTimeout(() => resolve({
                    some: 'data'
                }), 0)),
        })).then(() => {
            const {
                aCheck: {
                    task: {
                        meta: {
                            complete
                        }
                    }
                }
            } = getState()
            expect(complete).to.be.false
        })
    })
    it('should default action and state so that reducers can be nested', () => {
        const {
            getState
        } = createStore(
            combineReducers({
                app: (state = {
                    aCheck: createCheckReducer('app.aCheck')()
                }) => state
            }),
            applyMiddleware(thunk)
        )
        const {
            app: {
                aCheck
            }
        } = getState()
        expect(aCheck).to.be.an.object
    })
})
