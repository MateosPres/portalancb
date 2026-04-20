import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { ReviewQuizConfig } from '../types';
import {
    DEFAULT_REVIEW_QUIZ_CONFIG,
    REVIEW_QUIZ_CONFIG_COLLECTION,
    REVIEW_QUIZ_CONFIG_DOC_ID,
    normalizeReviewQuizConfig,
} from '../utils/reviewQuiz';

export const useReviewQuizConfig = () => {
    const [config, setConfig] = useState<ReviewQuizConfig>(DEFAULT_REVIEW_QUIZ_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = db.collection(REVIEW_QUIZ_CONFIG_COLLECTION).doc(REVIEW_QUIZ_CONFIG_DOC_ID).onSnapshot((snapshot) => {
            if (!snapshot.exists) {
                setConfig(DEFAULT_REVIEW_QUIZ_CONFIG);
                setLoading(false);
                return;
            }

            setConfig(normalizeReviewQuizConfig(snapshot.data() as Partial<ReviewQuizConfig>));
            setLoading(false);
        }, () => {
            setConfig(DEFAULT_REVIEW_QUIZ_CONFIG);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { config, loading };
};