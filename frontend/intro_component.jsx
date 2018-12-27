const GAME_CODE_ID = "gameCodeInputIdentifier";

class IntroComponent extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		let gameCode = document.getElementById(GAME_CODE_ID).value;
		$.post("/game", {gameCode: gameCode}, function() {
			console.log("done", gameCode);
		})
	}

	render() {
		let gameCodeForm = (<div>
			<form onSubmit={this.handleSubmit}>
				<label>
				  Code:
				  <input type="text" name="gameCode" id={GAME_CODE_ID} />
				 </label>	
				 <input type="submit" value="Submit" />
			</form>
		</div>);

		return gameCodeForm;
	}
}