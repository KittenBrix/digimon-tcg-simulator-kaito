import {create} from "zustand";
import {CardType, CardTypeGame, CardTypeWithId, DeckType, FetchCards} from "../utils/types.ts";
import axios from "axios";
import {uid} from "uid";
import 'react-toastify/dist/ReactToastify.css';
import {
    notifyAlreadyExists,
    notifyDelete,
    notifyError,
    notifyLength,
    notifyName, notifyRegistered,
    notifySuccess,
    notifyUpdate
} from "../utils/toasts.ts";
import {NavigateFunction} from "react-router-dom";
import {sortCards} from "../utils/functions.ts";

type State = {
    fetchedCards: CardTypeWithId[],
    isLoading: boolean,
    selectedCard: CardTypeWithId | CardTypeGame | null,
    deckCards: CardTypeWithId[],
    decks: DeckType[],
    nameOfDeckToEdit: string,
    user: string,
    activeDeckId: string,
    isSaving: boolean,
    avatarName: string,
    gameId: string,

    fetchCards: FetchCards,
    selectCard: (card: CardTypeWithId | CardTypeGame | null) => void,
    hoverCard: CardTypeWithId | null,
    setHoverCard: (card: CardTypeWithId | null) => void,
    addCardToDeck: (id: string, location: string, cardnumber: string, type: string) => void,
    deleteFromDeck: (id: string) => void,
    saveDeck: (name: string) => void,
    fetchDecks: () => void,
    updateDeck: (id: string, name: string) => void,
    setDeckById: (id: string | undefined) => void,
    deleteDeck: (id: string, navigate: NavigateFunction) => void,
    clearDeck: () => void,
    login: (userName: string, password: string, navigate: NavigateFunction) => void,
    me: () => void,
    register: (userName: string, password: string, setRegisterPage: (state: boolean) => void, navigate: NavigateFunction) => void,
    setActiveDeck: (deckId: string) => void,
    getActiveDeck: () => void,
    setAvatar: (avatarName: string) => void,
    getAvatar: () => string,
    setGameId: (gameId: string) => void,
};

export const useStore = create<State>((set, get) => ({

    fetchedCards: [],
    isLoading: false,
    selectedCard: null,
    hoverCard: null,
    deckCards: [],
    decks: [],
    nameOfDeckToEdit: "",
    user: "",
    activeDeckId: "",
    isSaving: false,
    avatarName: "",
    gameId: "",

    fetchCards: (name,
                 color,
                 type,
                 stage,
                 attribute,
                 digi_type,
                 dp,
                 play_cost,
                 evolution_cost,
                 level
    ) => {

        const queryParams = {
            name: name,
            color: color,
            type: type
        };

        set({isLoading: true})
        axios
            .get("/api/profile/cards", {params: queryParams})
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {

                let filteredData = data?.slice();

                if (filteredData === undefined) {
                    set({fetchedCards: [], isLoading: false});
                    return;
                }

                if (stage !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.stage === stage
                    );
                }
                if (attribute !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.attribute === attribute
                    );
                }
                if (digi_type !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.digi_type === digi_type
                    );
                }
                if (dp !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.dp === dp
                    );
                }
                if (play_cost !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.play_cost === play_cost
                    );
                }
                if (evolution_cost !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.evolution_cost === evolution_cost
                    );
                }
                if (level !== null) {
                    filteredData = filteredData.filter(
                        (card: CardType) => card.level === level
                    );
                }

                filteredData = filteredData.map((card: CardType) => ({
                    ...card,
                    id: uid()
                }));

                set({fetchedCards: filteredData});

            })
            .finally(() => set({isLoading: false}));

    },

    selectCard: (card) => {
        set({selectedCard: card});
        console.log(card);
    },

    setHoverCard: (card: CardTypeWithId | null) => {
        set({hoverCard: card});
    },

    addCardToDeck: (id, location, cardnumber, type) => {
        const cardToAdd = get().fetchedCards.filter((card) => card.id === id)[0];
        let cardToAddWithNewId;
        const digiEggsInDeck = get().deckCards.filter((card) => card.type === "Digi-Egg").length;
        const cardOfIdInDeck = get().deckCards.filter((card) => card.cardnumber === cardnumber).length;

        if (cardToAdd.cardnumber === "EX5-020" || cardToAdd.cardnumber === "EX5-012") {
            cardToAddWithNewId = {...cardToAdd, id: uid(), type: "Digimon"} // fetched EX5-020 & EX5-012 are typed incorrectly
        } else {
            cardToAddWithNewId = {...cardToAdd, id: uid()}
        }

        if (type === "Digi-Egg" && digiEggsInDeck < 5 && cardOfIdInDeck < 4) {
            set({deckCards: [cardToAddWithNewId, ...get().deckCards]});
            return;
        }

        const eggCardLength = get().deckCards.filter((card) => card.type === "Digi-Egg").length;
        const filteredLength = get().deckCards.length - eggCardLength; // 50 deck-cards & max 5 eggs

        if (location !== "fetchedData" || filteredLength >= 50) return;

        const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085"];
        if (cardsWithoutLimit.includes(cardnumber)) {     // unique effect
            set({deckCards: [cardToAddWithNewId, ...get().deckCards]});
            return;
        }

        if (type === "Digi-Egg" && digiEggsInDeck >= 5) return;

        if (cardOfIdInDeck >= 4) return;

        set({deckCards: [cardToAddWithNewId, ...get().deckCards]});
    },

    deleteFromDeck: (id) => {
        set({deckCards: get().deckCards.filter((card) => card.id !== id)});
    },

    saveDeck: (name) => {
        const eggCardLength = get().deckCards.filter((card) => card.type === "Digi-Egg").length;
        const filteredLength = get().deckCards.length - eggCardLength;

        if (filteredLength !== 50) {
            notifyLength();
            return;
        }

        if (name === "") {
            notifyName();
            return;
        }

        set({isSaving: true});

        const sortedDeck = sortCards(get().deckCards);

        const deckToSave = {
            name: name,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            cards: sortedDeck.map(({id, ...rest}) => rest),

            deckStatus: "INACTIVE"
        }

        axios
            .post("/api/profile/decks", deckToSave)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                throw error;
            })
            .then(() =>
                notifySuccess() &&
                setTimeout(function () {
                    window.location.reload();
                    set({isSaving: false});
                }, 3000));
    },

    fetchDecks: () => {
        set({isLoading: true})
        axios
            .get("/api/profile/decks")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {
                set({decks: data});
            }).finally(() => set({isLoading: false}));
    },

    updateDeck: (id, name) => {


        const deckWithoutId = {
            name: name,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            cards: get().deckCards.map(({id, ...rest}) => rest)
        }

        axios
            .put(`/api/profile/decks/${id}`, deckWithoutId)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                notifyError();
                throw error;
            })
            .then(() => {
                notifyUpdate();
            });
    },

    setDeckById: (id) => {

        if (id === undefined) return;

        get().fetchCards(null, null, null, null, null, null, null, null, null, null,);

        set({isLoading: true});

        axios
            .get(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {

                const cardsWithId = data.cards.map((card: CardType) => ({
                    ...card,
                    id: uid(),
                }));

                set({deckCards: cardsWithId});
                set({nameOfDeckToEdit: data.name});
                set({isLoading: false});
            });
    },

    deleteDeck: (id, navigate) => {

        axios
            .delete(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                notifyError();
                throw error;
            })
            .then(() => {
                navigate("/profile");
                set({deckCards: []});
                notifyDelete();
            });
    },

    clearDeck: () => {
        set({deckCards: []});
    },

    login: (userName: string, password: string, navigate: NavigateFunction) => {
        axios.post("/api/user/login", null, {
            auth: {
                username: userName,
                password: password
            }
        })
            .then(response => {
                set({user: response.data})
                navigate("/");
            })
            .catch(console.error)
    },

    me: () => {
        axios.get("/api/user/me")
            .then(response => set({user: response.data}))
    },

    register: (userName, password, setRegisterPage, navigate) => {
        const newUserData = {
            "username": `${userName}`,
            "password": `${password}`
        }

        axios.post("/api/user/register", newUserData)
            .then(response => {
                console.error(response)
                setRegisterPage(false);
                if (response.data === "Username already exists!") {
                    notifyAlreadyExists();
                }
                if (response.data === "Successfully registered!") {
                    notifyRegistered();
                    get().login(userName, password, navigate);
                }
            })
            .catch((e) => {
                console.error(e);
            });
    },

    setActiveDeck: (deckId) => {
        axios.put(`/api/user/active-deck/${deckId}`, null)
            .catch(console.error)
            .finally(() => {
                set({activeDeckId: deckId});
            });
    },

    getActiveDeck: () => {
        axios.get("/api/user/active-deck")
            .then(response => set({activeDeckId: response.data}))
            .catch(console.error);
    },

    setAvatar: (avatarName) => {
        axios.put(`/api/user/avatar/${avatarName}`, null)
            .catch(console.error)
            .finally(() => {
                set({avatarName: avatarName});
            });
    },

    getAvatar: () => {
        axios.get("/api/user/avatar")
            .then(response => set({avatarName: response.data}))
            .catch(console.error);

        return get().avatarName;
    },

    setGameId: (gameId) => {
        set({gameId: gameId});
    }

}));
