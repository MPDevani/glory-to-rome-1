const gameCodeId = "gameCode";

class IntroComponent extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		let gameCode = document.getElementById(gameCodeId).value;
		$.post("/game", {gameCode: gameCode}, function() {
			console.log("done", gameCode);
		})
	}

	render() {
		let gameCodeForm = (<div>
			<form onSubmit={this.handleSubmit}>
				<label>
				  Code:
				  <input type="text" name="gameCode" id={gameCodeId} />
				 </label>	
				 <input type="submit" value="Submit" />
			</form>
		</div>);

		return gameCodeForm;
	}
}