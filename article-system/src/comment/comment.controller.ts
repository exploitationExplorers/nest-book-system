import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentSearchDto } from './dto/comment-search.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Get() 
  async getHello() {
    return 'hello';
  }
  @Get('getCommentList')
  async getCommentList(@Query() query: CommentSearchDto) {
    return this.commentService.getCommentList(query);
  }

  @Post('addComment')
  async addComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.addComment(createCommentDto);
  }

  @Put('updateComment')
  async updateComment(@Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.updateComment(updateCommentDto);
  }

  @Delete('deleteComment/:id')
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(+id);
  }

  @Get('getArticleOptions')
  async getArticleOptions() {
    return this.commentService.getArticleOptions();
  }

  @Put('auditComment/:id/:status')
  async auditComment(
    @Param('id') id: string,
    @Param('status') status: '0' | '1' | '2',
  ) {
    return this.commentService.auditComment(+id, status);
  }
}
