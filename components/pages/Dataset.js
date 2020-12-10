import React, { useEffect, useState } from 'react';
import {getInstrumentsForDataset, getSpacecraftForDataset, getTargetsForDataset, getMissionsForDataset} from 'api/dataset.js'
import {stitchDatasetWithMockData} from 'api/mock'
import CollectionList from 'components/CollectionList.js'
import RelatedTools from 'components/RelatedTools'
import CitationBuilder from 'components/CitationBuilder'
import {InstrumentListBox, SpacecraftListBox, TargetListBox, MissionListBox} from 'components/ListBox'
import {DatasetDescription} from 'components/ContextObjects'
import {DatasetTagList} from 'components/TagList'
import { Link, Grid, Card, CardMedia, CardContent, List, ListItem, ListItemText, Typography, Paper, Box, Chip } from '@material-ui/core'
import InternalLink from 'components/InternalLink'
import { UnarchiveOutlined, FolderOutlined } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';
import PrimaryContent from 'components/PrimaryContent';
import ResponsiveLayout from 'components/ResponsiveLayout'
import TangentAccordion from 'components/TangentAccordion';
import CollectionBrowseLinks from 'components/CollectionBrowseLinks'
import { Helmet } from 'react-helmet'

const useStyles = makeStyles((theme) => ({
    citation: {
        padding: theme.spacing(2),
        color: theme.palette.secondary.dark
    },
    citationEnd: {
        alignSelf: 'flex-end'
    },
    quickLink: {
        maxWidth: 200
    },
    primaryButton: {
        width: '100%'
    },
    [theme.breakpoints.up('xs')]: {
        datasetIcon: {
            display: 'none'
        },
        datasetButton: {
            height: '80px', 
        }
    },
    [theme.breakpoints.up('sm')]: {
        datasetIcon: {
            display: 'block',
            height: '50px',
            width: '50px',
            marginRight: theme.spacing(2)
        },
        datasetButton: {
            height: '100px', 
        }
    },
    textListItem: {
        paddingTop: 0,
        paddingBottom: 0
    },
    deliveryInfo: {
        backgroundColor: theme.palette.secondary.main,
        padding: '15px',
        color: theme.palette.getContrastText(theme.palette.secondary.main),
        textAlign: 'center'
    },
    buttonIcon: {
        maxHeight: '25px'
    },
    metadataLabel: {
        width: '200px'
    }
}));

const types = {
    BUNDLE: 1,
    COLLECTION: 2,
    PDS3: 3,
}

const titles = {
    [types.BUNDLE]: "PDS4 Bundle",
    [types.COLLECTION]: "PDS4 Collection",
    [types.PDS3]: "PDS3 Dataset"
}

function Dataset({dataset, lidvid, mockup, pdsOnly, type}) {
    const [instruments, setInstruments] = useState(null)
    const [spacecraft, setSpacecraft] = useState(null)
    const [missions, setMissions] = useState(null)
    const [targets, setTargets] = useState(null)

    useEffect(() => {
        if(mockup) { stitchDatasetWithMockData(dataset) }
        getInstrumentsForDataset(dataset).then(setInstruments, console.error)
        getSpacecraftForDataset(dataset).then(setSpacecraft, console.error)
        getMissionsForDataset(dataset).then(setMissions, console.error)
        getTargetsForDataset(dataset).then(setTargets, console.error)
    }, [lidvid])

    return (
        <ResponsiveLayout itemScope itemType="https://schema.org/Dataset" primary={
            <>
            <DatasetTagList tags={dataset.tags}/>
            <Title dataset={dataset} type={type} />
            <DeliveryInfo dataset={dataset} />
            <RelatedTools tools={dataset.tools} noImages={!!mockup}/>

            <Metadata dataset={dataset}/>
            { type === types.COLLECTION && 
                <CollectionBrowseLinks dataset={dataset}/>
            }

            { type === types.BUNDLE && 
                <CollectionList dataset={dataset} />
            }
            <CollectionQuickLinks dataset={dataset} />
            <CollectionDownloads dataset={dataset} />

            <MoreInformation dataset={dataset} />
            
            <TangentAccordion title="Citation">
                <CitationBuilder dataset={dataset} />
            </TangentAccordion>
            </>
        } secondary={
            <Box p={1}>
                { targets && targets.length > 0 && <TargetListBox items={targets} compact={true}/> }
                { missions && missions.length > 0 && <MissionListBox items={missions} compact={true}/> }
                { spacecraft && spacecraft.length > 0 && <SpacecraftListBox items={spacecraft} compact={true}/> }
                { instruments && instruments.length > 0 && <InstrumentListBox items={instruments} compact={true}/> }
                
                <RelatedData dataset={dataset}/>
                <Superseded dataset={dataset}/>
                <RelatedPDS3 dataset={dataset}/>
                <LegacyDOIs dataset={dataset}/>                        
            </Box>
        }/>
    )
}

export function Bundle({...props}) {
    return <Dataset type={types.BUNDLE} {...props} />
}
export function Collection({...props}) {
    return <Dataset type={types.COLLECTION} {...props} />
}
export function PDS3Dataset({...props}) {
    return <Dataset type={types.PDS3} {...props} />
}

function Title({dataset, type}) {
    const classes = useStyles()
    const title = dataset.display_name ? dataset.display_name : dataset.title
    return <>
        <Box display="flex" alignItems="top" my={3}>
            <Box >
                { type === types.COLLECTION ? 
                    <FolderOutlined className={classes.datasetIcon}/> : 
                    <UnarchiveOutlined className={classes.datasetIcon}/>
                }
            </Box>
            <Typography variant="h1">
                { title }
                <Chip color="primary" variant="outlined" label={
                    <Typography variant="body2">{titles[type]}</Typography>
                    } style={{marginLeft: '10px'}}/>
            </Typography>
        </Box>
        <Helmet>
            <title>{ title }</title>
        </Helmet>
    </>
}

function Metadata({dataset}) {
    return <List>
            <MetadataItem label="Description" itemComponent={<DatasetDescription model={dataset}/>} itemProp="abstract" itemScope itemType="http://schema.org/Text"/>
            <MetadataItem label="Identifier (LID)" item={dataset.identifier} />
            <MetadataItem label="Version" item={dataset.version_id} />   
            <MetadataItem label="DOI" item={dataset.doi} />            
            <MetadataItem label="Authors" item={dataset.citation_author_list} itemProp="author" itemScope itemType="http://schema.org/Author"/>
            <TemporalMedatata label="Time Range" dataset={dataset} />
            <MetadataItem label="Status" item={dataset.publication ? dataset.publication.publish_status : null} />   
    </List>
}

function MoreInformation({dataset}) {
    return <TangentAccordion title="More Information">
        <MetadataItem label="Date Published" item={(dataset.publication && dataset.publication.publication_date) ? dataset.publication.publication_date : dataset.citation_publication_year} itemProp="datePublished" itemScope itemType="http://schema.org/Date"/>
        <MetadataItem label="Editors" item={dataset.citation_editor_list} itemProp="editor" itemScope itemType="http://schema.org/Person"/>
        <MetadataItem label="Type" item={"Data"} />
        <MetadataItem label="Local Mean Solar" item={dataset.localMeanSolar} />
        <MetadataItem label="Local True Solar" item={dataset.localTrueSolar} />
        <MetadataItem label="Solar Longitude" item={dataset.solarLongitude} />
        <MetadataItem label="Primary Result" item={dataset.primary_result_purpose} />
        <MetadataItem label="Primary Result Processing Level" item={dataset.primary_result_processing_level} />
        <MetadataItem label="Primary Result Wavelength Range" item={dataset.primary_result_wavelength_range} />
        <MetadataItem label="Primary Result Domain" item={dataset.primary_result_domain} />
        <MetadataItem label="Primary Result Discipline Name" item={dataset.primary_result_discipline_name} />
    </TangentAccordion>
}

function TemporalMedatata({label, dataset}) {
    let times = []
    if(!!dataset.observation_start_date_time) { times.push("Start Time: " + dataset.observation_start_date_time) }
    if(!!dataset.observation_stop_date_time) { times.push("Stop Time: " + dataset.observation_stop_date_time) }
    if(times.length === 0) { return null }

    return <MetadataItem label={label} item={times.join(' - ')} />
}

function MetadataItem({ item, itemComponent, label, ...otherProps }) {
    if(!item && !itemComponent) return null
    return <ListItem component={Grid} container direction="row" justify="flex-start" spacing={1}>
        <Grid item sm={3} xs={12}>
            <Typography variant="h6"> { label }</Typography>
        </Grid>
        <Grid item sm={9} xs={12}>
            {itemComponent || <Typography {...otherProps}>{item}</Typography> }
        </Grid>
    </ListItem>
}


function DeliveryInfo({dataset}) {
    const classes = useStyles()
    const publication = dataset.publication
    if(publication && publication.delivery_info) {
        return (
            <Paper className={classes.deliveryInfo}>
                <Typography>{publication.delivery_info}</Typography>
                <Typography>Latest release date: {publication.publication_date}</Typography>
            </Paper>
        )
    } else {
        return null
    }
}

function CollectionQuickLinks({dataset}) {
    const classes = useStyles()
    return (
        <PrimaryContent>
            <Grid container spacing={2} direction="row" justify="flex-start" alignItems="stretch">
                { dataset.local_documents_url &&
                    <Grid item xs={6} md={2} >
                        <Link href={dataset.local_documents_url} >
                            <Card raised={true} className={classes.quickLink} p={1}>
                                <CardMedia component="img" image="./images/icn-documents.png" alt={'Icon for documents'} title={'View Local Documents'}/>
                                <CardContent p="1">
                                    <Typography p="3" variant="h5" component="h2">View Local Documents</Typography>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                }
                { dataset.example &&
                    <Grid item xs={6} md={2} >
                        <Link href={dataset.example.url} >
                            <Card raised={true} className={classes.quickLink} p={1}>
                                <CardMedia component="img" image={
                                    dataset.example.thumbnail_url ?
                                        dataset.example.thumbnail_url :
                                        './images/icn-file.png'
                                } alt={'Icon for documents'} title={'Example file'}/>
                                <CardContent p="1">
                                    <Typography p="3" variant="h5" component="h2">{ dataset.collection_type === "Document"?     
                                        'Key Document' :
                                        'Example File'
                                    }</Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">{dataset.example.title}</Typography>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                }
            </Grid>
        </PrimaryContent>
    )
}

function CollectionDownloads({dataset}) {
    let downloads = dataset.download_packages
    if(!!downloads) {
        return (
            <section className="dataset-downloads">
                <h3>Download packages:</h3>
                <ul>
                    <li>
                        <img alt="" src="./images/icn-package.png" />
                        <a href={dataset.download_url}> 
                            <span> Download All 
                            { dataset.download_size &&
                                <span class="download-size">({ dataset.download_size })</span> 
                            }
                            </span>
                        </a>
                    </li>
                    { dataset.download_packages.map(pkg => (
                        <li key={pkg.download_url}>
                            <img alt="" src="./images/icn-package.png" />
                            <a href={pkg.download_url}>
                                <span> { pkg.name } 
                                { pkg.download_size &&
                                    <span class="download-size">({ pkg.download_size })</span> 
                                }
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        )
    } else { return null }
}

function RelatedPDS3(props) {
    const pds3 = props.dataset.pds3_version_url
    if(pds3) {
        return (
            <TangentAccordion title="PDS3 version">
                <List>
                    <ListItem button component={Link} href={pds3}>
                        <ListItemText primary="Click here to browse" primaryTypographyProps={{color: "primary"}}/>
                    </ListItem>
                </List>
            </TangentAccordion>
        )
    } else return null
}

function Superseded(props) {
    const superseded = props.dataset.superseded_data
    if(superseded) {
        return (
            <TangentAccordion title="Other versions">
                <List>
                    {superseded.map(ref => 
                        <ListItem button component={Link} key={ref.browse_url + ref.name} href={ref.browse_url}>
                            <ListItemText primary={ref.name} primaryTypographyProps={{color: "primary"}}/>
                        </ListItem>
                        )}
                </List>
            </TangentAccordion>
        )
    } else return null
}

function RelatedData(props) {
    const data = props.dataset.related_data
    if(data) {
        return (
            <TangentAccordion title="Related data">
                <List>
                    {data.map(ref => 
                        <InternalLink identifier={ref.lid} key={ref.lid} passHref>
                            <ListItem button component="a" href={'?identifier=' + ref.lid}>
                                <ListItemText primary={ref.name} primaryTypographyProps={{color: "primary"}}/>
                            </ListItem>
                        </InternalLink>
                        )}
                </List>
            </TangentAccordion>
        )
    } else return null
}

function LegacyDOIs(props) {
    const data = props.dataset.legacy_dois
    if(data) {
        return (
            <TangentAccordion title="Legacy DOIs">
                <List>
                    {data.map(ref => 
                        <ListItem button component={Link} key={ref.doi} href={'https://doi.org/' + ref.doi}>
                            <ListItemText primary={`${ref.date}: ${ref.doi}`} primaryTypographyProps={{color: "primary"}}/>
                        </ListItem>
                        )}
                </List>
            </TangentAccordion>
        )
    } else return null
}