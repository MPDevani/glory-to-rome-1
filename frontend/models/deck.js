export class Deck {
	constructor(deckObject) {
		this.id = deckObject.deck.id;
		this.cardCount = deckObject.cardCount;
	}
}