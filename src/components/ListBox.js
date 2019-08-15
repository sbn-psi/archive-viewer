import React from 'react';
import 'css/ListBox.scss'
import LID from 'services/LogicalIdentifier'
import Loading from 'components/Loading.js'



export default class ListBox extends React.Component {
    static type = {
        dataset: 'dataset',
        mission: 'mission',
        target: 'target',
        relatedTarget: 'relatedTarget',
        instrument: 'instrument',
        spacecraft: 'spacecraft'
    }

    constructor(props) {
        super(props)

        // Set minimum list length for displaying a list
        const min = 25
        this.state = {
            showAll: props.items ? props.items.length <= min : false
        }
    }

    itemCount = () => {
        let current = 0, type = this.state.type, items = this.props.items
        return (type === ListBox.type.relatedTarget) ? Object.keys(items).reduce((next, key) => current += items[key].length, current) : items.length
    }

    makeGroupedList = (groups) => {
        const titles = Object.keys(groups)
        const threshold = 5
        return titles.sort().map(title => (<GroupBox groupTitle={title} groupItems={groups[title]} query={types[this.props.type]['query']} showAll={titles.length < threshold} key={title} />))
    }

    makeList = (type) => {
        const {items, groupInfo, groupBy} = this.props

        if (type === ListBox.type.relatedTarget) {
            return <RelatedTargetsListBox targets={items} />
        }
        else {
            if (!items.length) return <NoItems />
            else if (items.length === 1) return <SingleItem item={items[0]} query={types[type]['query']} />
            else return groupBy ? this.makeGroupedList(this.groupby(items,types[groupBy].groupBy,groupInfo)) : <ul className="list"><List items={items} query={types[type]['query']} /></ul>
        }
    }

    groupby = (arr, val, groupInfo) => {
        /* Takes an array and a keyword to sort array on
            returns a grouped objects of lids and
            lists of associated datasets
        */
        let items = {}
        if (val === null || !groupInfo) {
            items['All'] = arr
        } else {
            arr.forEach(item => {
                const lids = item[val]
                if (lids && lids.length > 0) lids.map(lidvid => {
                    let host_name
                    const lid = new LID(lidvid).lid
                    const el = groupInfo.find(a => a.identifier === lid)
                    
                    if (el) host_name = el.display_name ? el.display_name : el.title
                    else host_name = lid
                    
                    if (!items[host_name]) items[host_name] = [item]
                    else items[host_name].push(item)
                })
            })
        }
        return items
    }
    
    render() {
        
        const {items, type} = this.props
        
        if(!!this.props.items) {
            return (
                <div className="list-box">
                    
                    <span className="title-box">
                        <h2 className="title">{ items && items.length === 1 ? types[type].titleSingular : types[type].title }</h2>
                        <h3 className="count">({ this.itemCount() })</h3>
                    </span>
                    
                    { this.makeList(type) }
                    
                </div>
            )
        } else {
            return <Loading/>
        }
    }
}
const types = {
    [ListBox.type.dataset]: {
        title: 'Datasets',
        titleSingular: 'Dataset',
        query: 'dataset'
    },
    [ListBox.type.mission]: {
        title: 'Missions',
        titleSingular: 'Mission',
        query: 'mission'
    },
    [ListBox.type.target]: {
        title: 'Targets',
        titleSingular: 'Target',
        query: 'target'
    },
    [ListBox.type.relatedTarget]: {
        title: 'Related Targets',
        titleSingular: 'Related Target',
        query: 'target'
    },
    [ListBox.type.instrument]: {
        title: 'Instruments',
        titleSingular: 'Instrument',
        query: 'instrument',
        groupBy: 'instrument_ref'
    },
    [ListBox.type.spacecraft]: {
        title: 'Spacecraft',
        titleSingular: 'Spacecraft',
        query: 'spacecraft',
        groupBy: 'instrument_host_ref'
    }
}
function SingleItem({item, query}) {
    return (<a className="single-item" href={`?${query}=${item.identifier}`}>{item.display_name ? item.display_name : item.title}</a>)
}

function List({items, query}) {
    return items.map((item,idx) => <li key={item.identifier + idx}><a href={`?${query}=${item.identifier}`}>{ item.display_name ? item.display_name : item.title }</a></li>)
}

class GroupBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showGroup: props.showAll
        }
    }
    
    listItems(items) {
        return items.map((item,idx) => <li key={item.identifier + idx}><a href={`?${this.props.query}=${item.identifier}`}><span className="list-item-name">{ item.display_name ? item.display_name : item.title }</span></a></li>)
    }

    toggleList = event => {
        event.preventDefault();
        this.setState({ showGroup: !this.state.showGroup });
    }

    render() {
        let items = this.props.groupItems, title = this.props.groupTitle

        return (
            <div>
                <div onClick={ this.toggleList } className="expandable">
                    <img src={ this.state.showGroup ? `images/collapse.svg` : `images/expand.svg` } className={ this.state.showGroup ? 'collapse' : 'expand' } />
                    <h3>{ title }</h3>
                </div>
                {this.state.showGroup
                    ? <ul className="list">{ this.listItems(items) }</ul>
                    : null}
            </div>
        )
    }
}

function RelatedTargetsListBox({targets}) {
    let newGroup = {}
    
    if (targets.parents && targets.parents.length) newGroup['Parents'] = targets.parents
    if (targets.children && targets.children.length) newGroup['Children'] = targets.children
    if (targets.associated && targets.associated.length) newGroup['Associated'] = targets.associated
    
    return (!Object.keys(newGroup).length) ? <NoItems /> : Object.keys(newGroup).map(title => (<GroupBox groupTitle={title} groupItems={newGroup[title]} query={'target'} showAll={true} />))
}

function NoItems() {
    return (
        <div>
            <p>No items...</p>
        </div>
    )
}