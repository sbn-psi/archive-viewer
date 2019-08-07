import React from 'react';
import 'css/ContextObjects.scss'
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import ListBox from 'components/ListBox'
import {Header, Description} from 'components/ContextObjects'
import Loading from 'components/Loading'

export default class Spacecraft extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            spacecraft: props.spacecraft,
            mission: null,
            missions: null,
            instruments: null,
            targets: null,
            datasets: null,
            loaded: false,
        }
    }

    componentDidMount() {
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => this.setState({targets}))
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => this.setState({instruments}))
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => this.setState({mission: (missions && missions.length > 0) ? missions[0] : null}))
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => this.setState({datasets}))
    }

    render() {
        const {spacecraft,mission,missions,datasets,instruments,targets} = this.state
        if (!spacecraft || datasets === null || targets === null || instruments === null || mission === null) return <Loading fullscreen={true}/>
        else {
            return (
                <div className="co-main">
                    <Header model={mission} type={Header.type.mission} />
                    <aside className="main-aside sidebox">
                        {mission && mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                            <a href={`?mission=${mission.identifier}`}><div className="button">Visit Mission Page</div></a>
                        }
                        <ListBox type="target"     items={targets} />
                        <ListBox type="instrument" items={instruments} />
                    </aside>
                    <Description model={mission} type={Description.type.mission} />
                    {mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                        <Header model={spacecraft} type={Header.type.spacecraft}/>
                    }
                    <ListBox type="dataset" items={datasets} groupBy="instrument" groupInfo={instruments} />
                </div>
            )
        }
    }
}
