import { initialLookup, serviceAvailable } from 'api/common';
import MissionContext from 'components/contexts/MissionContext';
import TargetContext from 'components/contexts/TargetContext';
import UnknownContext from 'components/contexts/UnknownContext';
import ErrorContext from 'components/contexts/ErrorContext';
import Loading from 'components/Loading';
import { PDS3Dataset } from 'components/pages/Dataset.js';
import NodeCache from 'node-cache';
import FrontPage from 'pages/index';
import React from 'react';
import { Helmet } from 'react-helmet';
import { resolveType, setTheme, types } from 'services/pages.js';
import GlobalContext from 'components/contexts/GlobalContext';
import Themed from 'components/Themed';
import runtime from 'services/runtime';
import { serializeError } from 'serialize-error';

function ProductPageContent({error, loaded, model, type, ...otherProps}) {

    if(error) {
        return <ErrorContext error={error} livid={livid}/>
    } else if (!loaded) {
        return <Loading fullscreen={true} />
    } else {
        switch(type) {
            case types.PDS3: return <PDS3Dataset dataset={model} {...otherProps}/>
            case types.TARGET: return <TargetContext type={type} target={model} model={model} {...otherProps}/>
            case types.INSTRUMENT: 
            case types.SPACECRAFT:
            case types.MISSION: return <MissionContext type={type} model={model} {...otherProps}/>
            case types.BUNDLE: 
            case types.COLLECTION: return <UnknownContext model={model} type={type} {...otherProps}/>
            default: return <FrontPage />
        }
    }
}

function ProductPage(props) {
    const {error, model, pdsOnly, backupMode, lidvid} = props
    if(!error) {

        const {display_name, title} = model
        const pageTitle = (display_name && !pdsOnly ? display_name : title) + ' - NASA Planetary Data System'

        return (
        <Themed {...props}>
            <GlobalContext backupMode={backupMode}>
                <PageMetadata pageTitle={pageTitle}/>
                <ProductPageContent {...props} />
            </GlobalContext>
        </Themed>
        )
    } else {
        return (
            <Themed {...props}>
                <GlobalContext backupMode={backupMode}>
                    <PageMetadata pageTitle={"Error"}/>
                    <ErrorContext error={error} lidvid={lidvid}/>
                </GlobalContext>
            </Themed>
        )
    }
}

function PageMetadata({pageTitle}) {
    return <Helmet>
        <title>{ pageTitle }</title>
        <meta charSet="utf-8" />
    </Helmet>
}

export default ProductPage

// 1-week cache for lidvids
const cache = new NodeCache({stdTTL: 60 * 60 * 24 * 7})

export async function getServerSideProps(context) {
    const { params, query } = context
    const [lidvid, ...extraPath] = params.identifier
    let props = { lidvid, extraPath };
    
    if(query.pdsOnly === 'true') { props.pdsOnly = true }
    if(query.mockup === 'true') { props.mockup = true }
    if(runtime.backupMode) { props.backupMode = true }

    if(!!query.flush) {
        cache.flushAll()
    }

    try {
        let result = cache.get(lidvid)
        if(!result) { 
            result = await initialLookup(lidvid, !!params.pdsOnly)
            cache.set(lidvid, result)
        } 
        
        props.loaded = true
        props.type = resolveType(result)
        props.model = result
    } catch(err) {
        props.error = err instanceof Error ? serializeError(err) : { message: err }
        serviceAvailable().then(yes => console.log('Service available'), no => {
            console.log('Switching to backup mode')
            // Engineering node registry not available. Switch to backup mode
            runtime.setBackupMode(true)
        })
    }

    setTheme(props, context)

    return { props }

}
