import { Controller, Get, Post, Body } from '@nestjs/common';
import { QuizService, QuizSubmitDto } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('questions')
  getQuestions() {
    return this.quizService.getQuestions();
  }

  @Post('submit')
  submitQuiz(@Body() body: QuizSubmitDto) {
    return this.quizService.submitQuiz(body);
  }
}
