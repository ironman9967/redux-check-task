
import { 
    get as _get,
    reduce
} from 'lodash/fp'

const getActionType = (stateKey, type) => `${stateKey}-${type}`

export const createTaskReducer = stateKey => (state = {
    stateKey,
    meta: {
        performing: false,
        complete: false,
        timing: null
    },
    results: null
}, {
    type,
    stateKey: actionStateKey,
    performance
} = {
    type,
    actionStateKey,
    performance
}) => {
    const taskActionType = stateKey == actionStateKey ? type : void 0
    switch (taskActionType) {
        case getActionType(stateKey, 'performing'):
            return {
                ...state,
                meta: {
                    performing: true,
                    complete: false,
                    timing: null
                },
                results: null
            }
        case getActionType(stateKey, 'complete'):
            const {
                timing,
                results
            } = performance
            return {
                ...state,
                meta: {
                    performing: false,
                    complete: true,
                    timing
                },
                results
            }
        default:
            return state
    }
}

export const createCheckReducer = stateKey => (state = {}, action) => {
    return {
        check: createTaskReducer(`${stateKey}.check`)(state.check, action),
        task: createTaskReducer(`${stateKey}.task`)(state.task, action),
    }
}

export const createTaskAction = ({
    stateKey,
    onlyOnce = false,
    task
}) => (dispatch, getState) => {
    const inform = (type, performance = { 
        timing: {
            started: null,
            duration: null
        },
        results: null
    }) => dispatch({
        type: getActionType(stateKey, type),
        stateKey,
        performance
    })
    const {
        meta: {
            performing,
            complete
        }
    } = stateKey ? _get(stateKey)(getState()) : getState()
        
    return Promise.resolve(
        !performing && (!onlyOnce || !complete)
        ? Promise.resolve(inform('performing'))
            .then(() => new Date())
            .then(started => Promise.all([
                started,
                task(dispatch, getState)
            ]))
            .then(([ started, results ]) => ({
                performance: {
                    timing: { 
                        started,
                        duration: new Date().getTime() - started.getTime()
                    },
                    results
                }
            }))
        : { alreadyPerformed: true }
    ).then(({
        alreadyPerformed,
        performance
    }) => {
        if (!alreadyPerformed) {
            inform('complete', performance)
        }
        return {
            stateKey,
            onlyOnce,
            alreadyPerformed: alreadyPerformed == void 0 ? false : alreadyPerformed,
            performance
        }
    })
}

export const createCheckAction = ({
    stateKey = '',
    check,
    checkOnlyOnce = false,
    autoPerformTask = true,
    task,
    taskOnlyOnce = false
}) => (dispatch, getState) => {
    const {
        check: {
            meta: {
                complete: checkComplete,
                performing: performingCheck
            },
            performance: prePerformCheckPerformance
        },
        task: {
            meta: {
                complete: prePerformTaskComplete
            },
            performance: prePerformTaskPerformance
        }
    } = stateKey ? _get(stateKey)(getState()) : getState()
    const checkStateKey = stateKey ? `${stateKey}.check`: 'check'
    const taskStateKey = stateKey ? `${stateKey}.task`: 'task'
    return Promise.resolve(
        !performingCheck && (!checkOnlyOnce || !checkComplete)
        ? dispatch(createTaskAction({
            stateKey: checkStateKey,
            onlyOnce: checkOnlyOnce,
            task: check
        })).then(checkRun => 
            checkRun.performance.results
            ? autoPerformTask
                ? dispatch(createTaskAction({
                    stateKey: taskStateKey,
                    onlyOnce: taskOnlyOnce,
                    task
                })).then(taskRun => ({
                    checkRun,
                    taskRun
                }))
                : {
                    checkRun,
                    taskRun: {
                        stateKey: taskStateKey,
                        onlyOnce: taskOnlyOnce,
                        alreadyPerformed: !taskOnlyOnce || !prePerformTaskComplete,
                        performance: {
                            timing: {
                                started: null,
                                duration: null
                            },
                            results: null
                        }
                    }
                }
            : {
                checkRun,
                taskRun: {
                    stateKey: taskStateKey,
                    onlyOnce: taskOnlyOnce,
                    alreadyPerformed: !taskOnlyOnce || !prePerformTaskComplete,
                    performance: prePerformTaskPerformance
                }
            })
        : {
            checkPerformance: {
                stateKey: checkStateKey,
                onlyOnce: checkOnlyOnce,
                alreadyPerformed: true,
                performance: prePerformCheckPerformance
            },
            taskPerformance: {
                stateKey: taskStateKey,
                onlyOnce: taskOnlyOnce,
                alreadyPerformed: !taskOnlyOnce || !prePerformTaskComplete,
                performance: prePerformTaskPerformance
            }
        }
    )
}

const prefixStateKey = (stateKey, ...prefixes) => 
    reduce((prefix, stateKey) => 
        `${prefix && prefix.length > 0 ? `${prefix}.` : ``}${stateKey}`, 
        stateKey)(prefixes)
    
export const createCheckForReducer = reducerKeyPrefix => name => stateKeyPrefix => 
    createCheckReducer(prefixStateKey(name, reducerKeyPrefix, stateKeyPrefix))
    
export const createTaskForReducer = reducerKeyPrefix => name => stateKeyPrefix => 
    createTaskReducer(prefixStateKey(name, reducerKeyPrefix, stateKeyPrefix))
