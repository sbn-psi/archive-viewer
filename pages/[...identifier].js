import { initialLookup } from 'api/common';
import MissionContext from 'components/contexts/MissionContext';
import TargetContext from 'components/contexts/TargetContext';
import UnknownContext from 'components/contexts/UnknownContext';
import ErrorMessage from 'components/Error.js';
import Loading from 'components/Loading';
import { PDS3Dataset } from 'components/pages/Dataset.js';
import NodeCache from 'node-cache';
import FrontPage from 'pages/index';
import React from 'react';
import { Helmet } from 'react-helmet';
import { resolveType, setTheme, types } from 'services/pages.js';
import GlobalContext from 'components/contexts/GlobalContext';
import Themed from 'components/Themed';

function ProductPageContent({error, loaded, model, type, ...otherProps}) {

    if(error) {
        return <ErrorMessage error={error} />
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
    const {error, model, pdsOnly} = props
    if(!error) {

        const {display_name, title} = model
        const pageTitle = (display_name && !pdsOnly ? display_name : title) + ' - NASA Planetary Data System'

        return (
        <Themed {...props}>
            <GlobalContext>
                <PageMetadata pageTitle={pageTitle}/>
                <ProductPageContent {...props} />
            </GlobalContext>
        </Themed>
        )
    } else {
        return <ErrorMessage error={error} />
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
        const type = resolveType(result)

        if(result.length === 0) {
            props.error = `No ${type} found for lidvid ${lidvid}`
        } else if(result.length > 1) {
            props.error = `More than one ${type} found for lidvid ${lidvid}`
        } else {
            props.type = type
            props.model = result
        }
    } catch(err) {
        props.error = err instanceof Error ? err.message : err
    }

    setTheme(props, context)

    return { props }

}
