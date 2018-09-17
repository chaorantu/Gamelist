import React, {Component} from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux';
import { updateGame, saveGame ,fetchGame} from '../actions';
import {Redirect} from 'react-router-dom'

class GamesForm extends Component{
    state = {
        _id: this.props.game ? this.props.game._id : null,
        title: this.props.game ? this.props.game.title : '',
        cover: this.props.game ? this.props.game.cover : '',
        errors: {},
        loading: false,
        done:false
    }

    componentDidMount() {
        const { match } = this.props;
        if (match.params._id) {
            this.props.fetchGame(match.params._id);
        }
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            _id: nextProps.game._id,
            title: nextProps.game.title,
            cover: nextProps.game.cover
        })
    }
    handleChange = (e) => {
        if(!!this.state.errors[e.target.name]) {
            let errors = Object.assign({}, this.state.errors);
            delete errors[e.target.name];
            this.setState({
                [e.target.name]: e.target.value,
                errors: errors
            });
        }else {
            this.setState({[e.target.name]: e.target.value});
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        let errors={};
        if(this.state.title === "") errors.title = "Can't be empty";
        if(this.state.cover === "") errors.cover = "Can't be empty";
        this.setState({errors});

        const isValid = Object.keys(errors).length === 0

        if(isValid){
            const {_id,title, cover} = this.state;
            this.setState({loading : true});
            if(_id){
                this.props.updateGame({ _id, title, cover }).then(
                    () => { this.setState({ done: true }) },//if success
                    (err) => err.response.json().then(({ errors }) => { this.setState({ errors, loading: false }) })//otherwise
                )
            }
            else {
                this.props.saveGame({title, cover}).then(
                    () => { this.setState({done: true}) },//if success
                    (err) => err.response.json().then(({errors}) => { this.setState({errors, loading: false}) })//otherwise
                )
            }
        }
    }

    render(){
        const form=(
            <form className={classnames('ui','form',{loading:this.state.loading})} onSubmit={this.handleSubmit}>
                <h1>Add new game</h1>

                { !!this.state.errors.global && <div className="ui negative message">{ this.state.errors.global }</div> }
                <div className={classnames('field',{error: !!this.state.errors.title})}>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={ this.state.title }
                        onChange={ this.handleChange }
                    />
                    <span>{this.state.errors.title}</span>
                </div>

                <div className={classnames('field',{error: !!this.state.errors.cover})}>
                    <label htmlFor="title">Cover Url</label>
                    <input
                        type="text"
                        name="cover"
                        value={ this.state.cover }
                        onChange={ this.handleChange }
                    />
                    <span>{this.state.errors.title}</span>
                </div>

                <div className="field">
                    { this.state.cover !== '' && <img src={ this.state.cover } alt="cover" className="ui small bordered image" /> }
                </div>

                <div className="field">
                    <button className="ui primary button">Save</button>
                </div>
            </form>
        )
        return(
            <div>
                {this.state.done ? <Redirect to="/games"/> : form}
            </div>
        );
    }

}

const mapStateToProps = (state, props) => {
    const {match}=props;
    if(match.params._id){
        return {
            game: state.games.find(item => item._id === match.params._id)
        };
    }
    return {game: null};
};

export default connect(mapStateToProps,{updateGame,saveGame,fetchGame})(GamesForm);