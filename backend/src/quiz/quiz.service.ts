import { Injectable } from '@nestjs/common';
import { QUIZ_QUESTIONS, QuizQuestionItem } from '../data/quiz-questions';

export interface QuestionDto {
  id: number;
  question: string;
  options: string[];
}

export interface GetQuestionsResponse {
  questions: QuestionDto[];
}

export interface QuizSubmitDto {
  webinarId?: string;
  answers?: Record<string, any>;
}

export interface QuizSubmitResponse {
  score: number;
  totalQuestions: number;
  webinarId: string | null;
  couponCode: string;
  discount: number;
  message: string;
}

@Injectable()
export class QuizService {
  /**
   * Return all 8 compliance questions without revealing any answers or keys.
   */
  getQuestions(): GetQuestionsResponse {
    const sanitizedQuestions: QuestionDto[] = QUIZ_QUESTIONS.map((q: QuizQuestionItem) => ({
      id: q.id,
      question: q.question,
      options: [...q.options],
    }));

    return {
      questions: sanitizedQuestions,
    };
  }

  /**
   * Normalize user answers from multiple possible formats:
   * - Letter: 'A', 'B', 'C', 'D' (case-insensitive)
   * - Index: 0, 1, 2, 3 (or string '0', '1', '2', '3')
   */
  private normalizeAnswerToLetter(ans: any): 'A' | 'B' | 'C' | 'D' | null {
    if (ans === undefined || ans === null) return null;
    const str = String(ans).trim().toUpperCase();
    if (str === 'A' || str === '0') return 'A';
    if (str === 'B' || str === '1') return 'B';
    if (str === 'C' || str === '2') return 'C';
    if (str === 'D' || str === '3') return 'D';
    return null;
  }

  /**
   * Calculate score and return result with coupon and message.
   */
  submitQuiz(body: QuizSubmitDto): QuizSubmitResponse {
    const rawAnswers = body?.answers || {};
    const webinarId = body?.webinarId || null;
    const totalQuestions = QUIZ_QUESTIONS.length;
    let score = 0;

    for (const q of QUIZ_QUESTIONS) {
      // Find the user's answer submitted for this question
      const submitted =
        rawAnswers[q.id] !== undefined
          ? rawAnswers[q.id]
          : rawAnswers[String(q.id)] !== undefined
            ? rawAnswers[String(q.id)]
            : rawAnswers[q.id - 1] !== undefined
              ? rawAnswers[q.id - 1]
              : rawAnswers[String(q.id - 1)];

      const normalized = this.normalizeAnswerToLetter(submitted);
      if (normalized !== null && normalized === q.correctLetter) {
        score += 1;
      }
    }

    const message =
      score >= 7
        ? 'Great job! Your compliance knowledge is strong. Keep strengthening your knowledge and stay updated on the latest compliance requirements.'
        : "There's always more to learn. Compliance requirements continue to evolve, so staying informed is important.";

    return {
      score,
      totalQuestions,
      webinarId,
      couponCode: 'COMPLY10',
      discount: 10,
      message,
    };
  }
}
