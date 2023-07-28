import styled from '@emotion/styled';
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lotties/loading.json";
import noCardsFoundAnimation from "../assets/lotties/noCardsFound.json";
import gatchmon from "../assets/gatchmon.png";
import {useStore} from "../hooks/useStore.ts";
import {CardTypeWithId} from "../utils/types.ts";
import {lazy, Suspense} from 'react';

const Card = lazy(() => import('./Card.tsx'));

const Loading = () => <LoadingContainer>
    <Lottie animationData={loadingAnimation} loop={true} style={{width: "90px"}}/>
    <img alt="gatchmon" src={gatchmon} width={80} height={100}/>
</LoadingContainer>

export default function FetchedCards() {

    const isLoading = useStore((state) => state.isLoading);
    const cards = useStore((state) => state.fetchedCards);

    return (
        <FetchContainer>
            <Suspense fallback={<Loading/>}>
                <StyledFieldset>

                    {!isLoading
                        ? cards?.map((card: CardTypeWithId) => (
                            <Card key={card.cardnumber} card={card} location={"fetchedData"}/>
                        ))
                        : (
                            <Loading/>
                        )}

                    {!isLoading && !cards && (
                        <LoadingContainer>
                            <Lottie animationData={noCardsFoundAnimation} loop={false} style={{width: "70px"}}/>
                            <img alt="gatchmon" src={gatchmon} width={80} height={100}/>
                        </LoadingContainer>
                    )}

                </StyledFieldset>
            </Suspense>
        </FetchContainer>
    );
}

const FetchContainer = styled.div`

  background-color: rgba(18, 17, 17, 0.985);
  width: 97%;
  padding: 1.5%;
  border-radius: 5px;
  height: 35vh;


`;

const StyledFieldset = styled.fieldset`
  color: #C5C5C5;
  height: 89.5%;
  border-radius: 5px;
  margin-top: 2px;
  transform: translateX(0.5px);

  display: flex;
  flex-flow: row wrap;
  gap: 1.8vw;

  overflow: auto;
  scrollbar-width: thin;

  @media (min-width: 767px) {
    gap: 0.9vw;
    height: 93%;
  }
`;

const LoadingContainer = styled.div`
  height: 90%;
  width: 90%;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;