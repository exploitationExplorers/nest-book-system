import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { SystemManageService } from './system-manage.service';
import { RoleSearchDto } from './dto/role.dto';
import { UserSearchDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('systemManage')
export class SystemManageController {
  constructor(private readonly systemManageService: SystemManageService) {}
  @Get()
  getHello() {
    return this.systemManageService.Init()
  }
  @Get('getRoleList')
  async getRoleList(@Query() roleSearchDto: RoleSearchDto) {
    return await this.systemManageService.getRoleList(roleSearchDto);
  }

  @Get('getAllRoles')
  async getAllRoles() {
    return await this.systemManageService.getAllRoles();
  }

  @Get('getUserList')
  async getUserList(@Query() query: UserSearchDto) {
    return await this.systemManageService.getUserList(query);
  }

  @Post('addUser')
  async addUser(@Body() createUserDto: CreateUserDto) {
    return await this.systemManageService.addUser(createUserDto);
  }
  // update user
  @Put('updateUser')
  async updateUser(@Body() updateUserDto: any) {
    return await this.systemManageService.updateUser(updateUserDto);
  }

  // delete user
  @Delete('deleteUser')
  async deleteUser(@Body() id: number) {
    return await this.systemManageService.deleteUser(id);
  }
}
