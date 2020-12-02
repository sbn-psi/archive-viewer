import React from 'react';
import 'css/ContextObjects.scss'
import {getMissionsForSpacecraft, getTargetsForSpacecraft, getInstrumentsForSpacecraft, getDatasetsForSpacecraft} from 'api/spacecraft.js'
import {TargetListBox, DatasetListBox, groupType} from 'components/ListBox'
import {InstrumentBrowseTable} from 'components/BrowseTable'
import {MissionHeader, SpacecraftHeader, MissionDescription, Menu, SpacecraftDescription} from 'components/ContextObjects'
import Loading from 'components/Loading'
import {SpacecraftTagList} from 'components/TagList'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import {targetSpacecraftRelationshipTypes} from 'api/relationships'
import PrimaryLayout from 'components/PrimaryLayout'
import { Button } from '@material-ui/core'
import { isPdsOnlyMode } from 'api/mock';
import { buildUrl } from 'api/router';

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
        getMissionsForSpacecraft(this.state.spacecraft).then(missions => this.setState({mission: (missions && missions.length > 0) ? missions[0] : null}), er => console.log(er))
        getTargetsForSpacecraft(this.state.spacecraft).then(targets => this.setState({targets}), er => console.log(er))
        getInstrumentsForSpacecraft(this.state.spacecraft).then(instruments => this.setState({instruments}), er => console.log(er))
        getDatasetsForSpacecraft(this.state.spacecraft).then(datasets => this.setState({datasets}), er => console.log(er))
    }

    render() {
        const {spacecraft,mission} = this.state
        if (!spacecraft || mission === null) return <Loading fullscreen={true}/>
        else {
            return (
                <div className="co-main">
                    { isPdsOnlyMode() ? <SpacecraftHeader model={spacecraft}/> : <MissionHeader model={mission} />
                    /* this is intentionally a mission header on the spacecraft page, since that is likely more relevant */}

                    <Menu/>
                    <PrimaryLayout primary={   
                        <>
                        <SpacecraftTagList tags={spacecraft.tags} />
                        { isPdsOnlyMode() ? <SpacecraftDescription model={spacecraft}/> : <MissionDescription model={mission} />
                        /* this is intentionally a mission description on the spacecraft page, since that is likely more relevant */}
                        {mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                            <SpacecraftHeader model={spacecraft} />
                        }
                        <HTMLBox markup={spacecraft.html1} />
                        <RelatedTools tools={spacecraft.tools}/>
                        <InstrumentBrowseTable items={this.state.instruments} />
                        <DatasetListBox items={this.state.datasets} groupBy={groupType.instrument} groupInfo={this.state.instruments} />
                        <PDS3Results name={spacecraft.display_name ? spacecraft.display_name : spacecraft.title} hostId={spacecraft.pds3_instrument_host_id}/>
                        <HTMLBox markup={spacecraft.html2} />
                        </>
                    } secondary = {
                        <>
                        {mission && mission.instrument_host_ref && mission.instrument_host_ref.length > 1 &&
                            <Button color="primary" variant="contained" href={buildUrl(mission.identifier)} style={{width: "100%"}}>Visit Mission Page</Button>
                        }
                        <TargetListBox items={this.state.targets} groupInfo={targetSpacecraftRelationshipTypes}/>
                        </>
                    }/>
                </div>
            )
        }
    }
}
