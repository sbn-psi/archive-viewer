import { Breadcrumbs as MaterialBreadcrumbs, Link, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import InternalLink from 'components/InternalLink';

export default function Breadcrumbs({home, current, currentTitle, subsectionLink}) {
    if(!home || !(current || currentTitle)) {
        return <SkeletonBreadcrumbs/>
    }
    return <MaterialBreadcrumbs>
        <InternalLink identifier={home.identifier} passHref><Link color="inherit">{home.display_name || home.title}</Link></InternalLink>
        {subsectionLink}
        <Typography color="textPrimary" noWrap>{currentTitle || current.display_name || current.title}</Typography>
    </MaterialBreadcrumbs>
}

function InstrumentBreadcrumbs(props) {
    return <Breadcrumbs {...props} subsectionLink={
        <InternalLink identifier={props.home.identifier} additionalPath="instruments" passHref><Link color="inherit">Instruments</Link></InternalLink>
    }/>
}

function DatasetBreadcrumbs(props) {
    if(!props.home) {
        return <SkeletonBreadcrumbs/>
    }
    return <Breadcrumbs {...props} subsectionLink={
        <InternalLink identifier={props.home.identifier} additionalPath="data" passHref><Link color="inherit">Data</Link></InternalLink>
    }/>
}

function SkeletonBreadcrumbs() {
    return <MaterialBreadcrumbs>
        <Skeleton variant="text" width={80}></Skeleton>
        <Skeleton variant="text" width={80}></Skeleton>
    </MaterialBreadcrumbs>
}
export { InstrumentBreadcrumbs, DatasetBreadcrumbs }