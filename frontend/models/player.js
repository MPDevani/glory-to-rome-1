export class Player {
	constructor(playerObject, handObject, cards) {
		this.id = playerObject.id;
		this.username = playerObject.username;
		if (cards) {
			this.cards = cards;
		}
	}
}