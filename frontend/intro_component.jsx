const GAME_CODE_ID = "gameCodeInputIdentifier";
const PLAYER_NAME_ID = "playerNameInputIdentifier";

class IntroComponent extends React.Component {
	constructor(props) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		let gameCode = document.getElementById(GAME_CODE_ID).value;
		let playerName = document.getElementById(PLAYER_NAME_ID).value;

		let payload = {
			gameCode: gameCode,
			playerName: playerName
		};

		$.post("/game", payload, function(result) {
			console.log(result);
		})
	}

	render() {
		let gameCodeForm = (<div>
			<form onSubmit={this.handleSubmit}>
				<label>
				  Player Name:
				  <input type="text" name="playerName" id={PLAYER_NAME_ID} />
				  Code:
				  <input type="text" name="gameCode" id={GAME_CODE_ID} />
				 </label>	
				 <input type="submit" value="Submit" />
			</form>
		</div>);

		return gameCodeForm;
	}
}