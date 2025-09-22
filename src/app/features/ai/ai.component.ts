import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface AIConversation {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  type: 'user' | 'ai';
}

@Component({
  selector: 'app-ai',
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
})
export class AI {
  protected currentMessage = '';
  protected readonly isLoading = signal(false);

  protected readonly aiFeatures = signal([
    {
      title: 'Market Analysis',
      description:
        'Get AI-powered insights on market trends, price movements, and technical indicators.',
      icon: 'analytics',
      color: '#2196f3',
      action: 'Analyze Markets',
    },
    {
      title: 'Trading Strategies',
      description: 'Discover personalized trading strategies based on your risk profile and goals.',
      icon: 'psychology',
      color: '#4caf50',
      action: 'Get Strategies',
    },
    {
      title: 'Portfolio Optimization',
      description: 'Optimize your portfolio allocation with AI-driven recommendations.',
      icon: 'account_balance',
      color: '#ff9800',
      action: 'Optimize Portfolio',
    },
    {
      title: 'Risk Assessment',
      description: 'Evaluate potential risks and get suggestions for risk management.',
      icon: 'security',
      color: '#e91e63',
      action: 'Assess Risk',
    },
  ]);

  protected readonly quickQuestions = signal([
    'What are the current market trends?',
    'How should I diversify my portfolio?',
    'What are the best trading strategies for beginners?',
    'How do I manage trading risks?',
    'What stocks should I watch today?',
  ]);

  protected readonly chatHistory = signal<AIConversation[]>([
    {
      id: '1',
      question: 'Hello! How can you help me with trading?',
      answer:
        "Hi! I'm your AI trading assistant. I can help you with market analysis, trading strategies, portfolio optimization, risk management, and answer any questions about investing. What would you like to know?",
      timestamp: new Date(),
      type: 'ai',
    },
  ]);

  sendMessage(): void {
    const message = this.currentMessage.trim();
    if (!message || this.isLoading()) return;

    // Add user message
    const userMessage: AIConversation = {
      id: Date.now().toString(),
      question: message,
      answer: '',
      timestamp: new Date(),
      type: 'user',
    };

    this.chatHistory.update((history) => [...history, userMessage]);
    this.currentMessage = '';
    this.isLoading.set(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIConversation = {
        id: (Date.now() + 1).toString(),
        question: '',
        answer: this.generateAIResponse(message),
        timestamp: new Date(),
        type: 'ai',
      };

      this.chatHistory.update((history) => [...history, aiResponse]);
      this.isLoading.set(false);
    }, 2000);
  }

  askQuickQuestion(question: string): void {
    this.currentMessage = question;
    this.sendMessage();
  }

  clearChat(): void {
    this.chatHistory.set([
      {
        id: '1',
        question: 'Hello! How can you help me with trading?',
        answer:
          "Hi! I'm your AI trading assistant. I can help you with market analysis, trading strategies, portfolio optimization, risk management, and answer any questions about investing. What would you like to know?",
        timestamp: new Date(),
        type: 'ai',
      },
    ]);
  }

  private generateAIResponse(message: string): string {
    const responses = [
      'Based on current market analysis, I recommend focusing on diversified investments with a balanced risk profile.',
      "That's a great question! For beginners, I suggest starting with index funds and gradually learning about individual stock analysis.",
      'Market volatility is normal. The key is to maintain a long-term perspective and stick to your investment strategy.',
      'Technical analysis suggests looking at moving averages, RSI, and volume indicators for better entry and exit points.',
      'Risk management is crucial. Consider position sizing, stop-losses, and never invest more than you can afford to lose.',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}
