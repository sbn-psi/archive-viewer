import React from 'react';
import 'css/ContextObjects.scss'
import {getSpacecraftForInstrument, getDatasetsForInstrument, getRelatedInstrumentsForInstrument} from 'api/instrument.js'
import {InstrumentHeader, InstrumentDescription, Menu} from 'components/ContextObjects'
import {DatasetListBox, InstrumentListBox, SpacecraftListBox} from 'components/ListBox'
import Loading from 'components/Loading'
import {InstrumentTagList} from 'components/TagList'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import {instrumentSpacecraftRelationshipTypes} from 'api/relationships'
import PrimaryLayout from 'components/PrimaryLayout'

export default class Instrument extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            instrument: props.instrument,
            datasets: null,
            spacecraft: null,
            instruments: null, // related instruments
            loaded: false,
        }
    }

    componentDidMount() {
        getSpacecraftForInstrument(this.state.instrument).then(spacecraft => {
            this.setState({spacecraft})
            getRelatedInstrumentsForInstrument(this.state.instrument, spacecraft).then(instruments => this.setState({instruments}), er => console.log(er))
        }, er => console.log(er))
        getDatasetsForInstrument(this.state.instrument).then(datasets => this.setState({datasets}), er => console.log(er))
    }

    render() {
        const {instrument,datasets,spacecraft,instruments} = this.state
        if (!instrument ) return <Loading fullscreen={true} />
        else return (
            <div className="co-main">
                <InstrumentHeader model={instrument} />
                <Menu/>
                <PrimaryLayout primary={
                    <>
                    <InstrumentTagList tags={instrument.tags} />
                    <InstrumentDescription model={instrument} />
                    <HTMLBox markup={instrument.html1} />
                    <RelatedTools tools={instrument.tools}/>
                    <DatasetListBox items={datasets} />
                    <PDS3Results name={instrument.display_name ? instrument.display_name : instrument.title} instrumentId={instrument.pds3_instrument_id} hostId={instrument.pds3_instrument_host_id}/>
                    <HTMLBox markup={instrument.html2} />
                    </>
                } secondary = {
                    <>
                    <SpacecraftListBox items={spacecraft} groupInfo={instrumentSpacecraftRelationshipTypes}/>
                    <InstrumentListBox items={instruments} groupInfo={instrumentSpacecraftRelationshipTypes} />
                    </>
                }/>
            </div>
        )
    }
}