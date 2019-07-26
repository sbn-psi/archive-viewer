import web from 'axios';
import desolrize from 'desolrize.js'
import LID from 'services/LogicalIdentifier.js'

const defaultParameters = () => { return {
    wt: 'json'
}}
let fail = msg => new Promise((_, reject) => { reject(new Error(msg)) })

export function httpGet(endpoint, params) {
    const paramsWithDefaultsApplied = Object.assign(defaultParameters(), params)
    return new Promise((resolve, reject) => 
        web.get(endpoint, { params: paramsWithDefaultsApplied }).then(response => resolve(desolrize(response.data)), reject)
    )
}

export function httpGetFull(endpoints) {

    if(!endpoints || endpoints.constructor !== Array) fail("Expected array of API calls")
    if(endpoints.length !== 2) fail("Expected only two endpoints to call")

    return new Promise((resolve, reject) => {
        let calls = endpoints.map(endpoint => httpGet(endpoint.url, endpoint.params))
        console.log(`calling ${endpoints.map(e => e.url + '\n')}`)
        Promise.all(calls).then(values => {
            let [core, webUI] = values
            if(!core) {
                reject(new Error(`None found`))
            }
            else if(webUI.length === 1 && core.length === 1) {
                let consolidated = Object.assign({}, core[0])
                resolve(Object.assign(consolidated, webUI[0]))
            } else {
                reject(new Error(`Received unexpected number of results
                
                ${webUI.map(w => w.logical_identifier).join('\n')}
                ${core.map(c => c.lid).join('\n')}
                `))
            }
        }, error => {
            reject(error)
        })
    })
}

export function httpGetRelated(initialQuery, route, knownLids) {
    return new Promise((resolve, reject) => {
        httpGet(route, initialQuery).then(results => {
            let foundLids = results.map(items => items.identifier)
            if(!knownLids || knownLids.length == 0 || arraysEquivalent(foundLids, knownLids)) {
                // if we have all the referenced items, just return them
                resolve(results)
            } else {
                // otherwise, perform another query to get the other 
                let params = {
                    q: knownLids.reduce((query, lid) => query + 'identifier:"' + new LID(lid).lid + '" ', '')
                }
                httpGet(route, params).then(otherResults => {
                    // and combine them with the original list
                    let combined = [...results, ...otherResults]
                    resolve(combined.filter((item, index) => combined.findIndex(otherItem => item.identifier === otherItem.identifier) === index))
                }, reject)
            }
        }, reject)
    })
}
function arraysEquivalent(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((el) => arr2.includes(el))
}