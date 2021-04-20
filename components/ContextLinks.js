import { Button, Card, CardActions, CardContent, List as MaterialList, ListItem, ListItemText, makeStyles, Typography } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import InternalLink from 'components/InternalLink';
import React from 'react';
import Description from './Description';


const useStyles = makeStyles((theme) => ({
    card: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    cardContent: {
        flex: 1
    },
    target: {
        backgroundColor: theme.custom.targetThemeColor
    },
    mission: {
        backgroundColor: theme.custom.missionThemeColor
    }
}));

function ContextList({items, active}) {    
    if(!items || !items.length) { return null}
    let sortedItems = items.sort((a, b) => {
        return nameFinder(a).localeCompare(nameFinder(b))
    })
    return (
        <MaterialList>
            {sortedItems.map((item,idx) => 
                <ContextLink key={item.identifier + '' +  idx} item={item} active={active}/>
            )}
        </MaterialList>
    )
}

function ContextLink({item, displayTag, active}) {
    return (
        <InternalLink identifier={item.logical_identifier ? item.logical_identifier : item.identifier} passHref>
        <ListItem button component="a" selected={active === item.identifier}>
            <ListItemText primary={ nameFinder(item) + ((displayTag && !!item.tags) ? ` - ${item.tags[0]}` : '')} 
            primaryTypographyProps={{color: "primary"}}/>
        </ListItem>
        </InternalLink>
    )
}

function nameFinder(item) {
    return item.display_name ? item.display_name : item.title ? item.title : item.identifier
}

function ContextCardList({items, ...otherProps}) {    
    if(!items || !items.length) { return null}
    let sortedItems = items.sort((a, b) => {
        return nameFinder(a).localeCompare(nameFinder(b))
    })
    return (
        <>
            {sortedItems.map((item,idx) => 
                <ContextCard key={item.identifier + '' +  idx} item={item} {...otherProps} />
            )}
        </>
    )
}

function ContextCard({item, classType, path, title}) {
    const name = nameFinder(item)
    const classes = useStyles();
    return (
        <Card raised={true} className={`${classes.card} ${classType}`} p={1}>
            <CardContent className={classes.cardContent} p="1">
                <Typography style={{marginTop: 0}} variant="h3" component="h2" gutterBottom>{name}</Typography>
                <Description model={item}/>
            </CardContent>
            <CardActions>
                <InternalLink identifier={item.identifier} additionalPath={path} passHref>
                    <Button color="primary" variant="contained" endIcon={<ExitToApp/>}>{title}</Button>
                </InternalLink>
            </CardActions>
        </Card>
    )
}

function TargetContextCardList(props) {
    const classes = useStyles();
    return <ContextCardList classType={classes.target} title="View Target" {...props}/>
}

function MissionContextCardList(props) {
    const classes = useStyles();
    return <ContextCardList classType={classes.mission} path="instruments" title="View Data" {...props}/>
}


export { ContextList, ContextLink, TargetContextCardList, MissionContextCardList };
