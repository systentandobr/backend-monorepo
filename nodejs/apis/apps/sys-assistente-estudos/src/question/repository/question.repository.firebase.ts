// import { Injectable } from '@nestjs/common';
// import { FirebaseService } from '../../firebase/firebase.service';
// import { Question } from '../model/question.schema';
// import { CollectionReference } from '@google-cloud/firestore';

// @Injectable()
// export class QuestionsRepositoryFirebase {
//   private questionsCollection: CollectionReference;

//   constructor(private firebaseService: FirebaseService) {
//     this.questionsCollection = this.firebaseService.getFirestore().collection('questions');
//   }

//   async findAll(): Promise<Question[]> {
//     const snapshot = await this.questionsCollection.get();
//     return snapshot.docs.map(doc => {
//       const data = doc.data();
//       return new Question(doc.id, data.questionText, data.options, data.correctAnswer);
//     });
//   }

//   async createQuestion(question: Question): Promise<void> {
//     await this.questionsCollection.doc(question.id).set({
//       questionText: question.questionText,
//       options: question.options,
//       correctAnswer: question.correctAnswer,
//     });
//   }

//   async getQuestionById(id: string): Promise<Question | null> {
//     const doc = await this.questionsCollection.doc(id).get();
//     if (!doc.exists) {
//       return null;
//     }
//     const data = doc.data();
//     return new Question(id, data.questionText, data.options, data.correctAnswer);
//   }

//   async updateQuestion(id: string, question: Partial<Question>): Promise<void> {
//     await this.questionsCollection.doc(id).update(question);
//   }

//   async deleteQuestion(id: string): Promise<void> {
//     await this.questionsCollection.doc(id).delete();
//   }
// }
