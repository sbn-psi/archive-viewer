import React from 'react';

export default class Mission extends React.Component {
    constructor(props) {
        super(props)
        const mission = props.mission
        this.state = {
            mission: mission,
            loaded: false,
        }
    }

    componentDidMount() {
    }

    render() {
        const {mission} = this.state
        return (
            <div>
                <Header model={mission} />
                <Description model={mission} />

            </div>
        )
    }
}

function Header({model}) {
    const {display_name, title, image_url} = model
    const name = display_name ? display_name : title
    return (
        <div className="mission-header">
            <img src={image_url} />
            <h1> { name } Data Archive </h1>
        </div>
    )
}

function Description({model}) {
    const {display_description, investigation_description} = model
    const description = display_description ? display_description : investigation_description
    return <h3 itemProp="description" className="resource-description">{ description }</h3>
}
