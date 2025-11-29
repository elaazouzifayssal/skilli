import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Get all conversations for current user
   * GET /api/messages/conversations
   */
  @Get('conversations')
  async getConversations(@Request() req) {
    return this.messagesService.getUserConversations(req.user.id);
  }

  /**
   * Get or create conversation with another user
   * GET /api/messages/conversations/:otherUserId
   */
  @Get('conversations/:otherUserId')
  async getOrCreateConversation(@Request() req, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.getOrCreateConversation(req.user.id, otherUserId);
  }

  /**
   * Get messages in a conversation
   * GET /api/messages/:conversationId
   */
  @Get(':conversationId')
  async getMessages(@Param('conversationId') conversationId: string, @Request() req) {
    return this.messagesService.getConversationMessages(conversationId, req.user.id);
  }

  /**
   * Send a message
   * POST /api/messages
   */
  @Post()
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.id, dto.receiverId, dto.text);
  }

  /**
   * Get unread message count
   * GET /api/messages/unread/count
   */
  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
  }
}
