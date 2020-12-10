import React, { useEffect, useState } from 'react';
import {getDatasetsForTarget, getSpacecraftForTarget, getRelatedTargetsForTarget} from 'api/target'
import {TargetHeader, TargetDescription, Menu} from 'components/ContextObjects'
import {RelatedTargetListBox, DatasetListBox, groupType} from 'components/ListBox'
import {SpacecraftBrowseTable} from 'components/BrowseTable'
import {TargetTagList} from 'components/TagList'
import HTMLBox from 'components/HTMLBox'
import RelatedTools from 'components/RelatedTools'
import PDS3Results from 'components/PDS3Results'
import PrimaryLayout from 'components/PrimaryLayout'

export default function Target({target, lidvid}) {
    const [datasets, setDatasets] = useState(null)
    const [spacecraft, setSpacecraft] = useState(null)
    const [relatedTargets, setRelatedTargets] = useState(null)

    useEffect(() => {
        getDatasetsForTarget(target).then(setDatasets, er => console.error(er))
        getSpacecraftForTarget(target).then(setSpacecraft, er => console.error(er))
        getRelatedTargetsForTarget(target).then(setRelatedTargets, er => console.error(er))

        return function cleanup() {
            setDatasets(null)
            setSpacecraft(null)
            setRelatedTargets(null)
        }
    }, [lidvid])

    return (
        <div className="co-main">
            <TargetHeader model={target} />
            <Menu/>
            <PrimaryLayout primary={
                <>
                <TargetTagList tags={target.tags} />
                <TargetDescription model={target} />
                <HTMLBox markup={target.html1} />
                <RelatedTools tools={target.tools}/>
                <SpacecraftBrowseTable items={spacecraft} />
                <DatasetListBox items={datasets} groupBy={groupType.spacecraft} groupInfo={spacecraft}/>
                <PDS3Results name={target.display_name ? target.display_name : target.title}/>
                <HTMLBox markup={target.html2} />
                </>
            } secondary = {
                <RelatedTargetListBox items={relatedTargets} />
            }/>
        </div>
    )
}