import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuestionPG {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  questionText: string;
  @Column('json')
  options: string[];
  @Column()
  correctAnswer: string;

  constructor(
    id?: string,
    questionText?: string,
    options?: string[],
    correctAnswer?: string,
  ) {
    this.id = id;
    this.questionText = questionText;
    this.options = options;
    this.correctAnswer = correctAnswer;
  }
}
