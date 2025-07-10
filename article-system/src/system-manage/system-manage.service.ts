import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Like } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { RoleSearchDto } from './dto/role.dto';
import { UserSearchDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class SystemManageService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}
  async Init() {
    const user1 = new User();
    user1.userName = '张三';
    const user2 = new User();
    user2.userName = '李四';
    const role1 = new Role();
    role1.roleCode = 'admins';
    role1.roleName = '管理员';
    const role2 = new Role();
    role2.roleCode = 'users';
    role2.roleName = '普通用户';
    user1.roles = [role1];

    user2.roles = [role2];
    await this.entityManager.save(Role, [role1, role2]);

    await this.entityManager.save(User, [user1, user2]);
  }
  async getRoleList(roleSearchDto: RoleSearchDto) {
    const {
      current = 1,
      size = 10,
      roleCode,
      roleName,
      status,
    } = roleSearchDto;

    // 构建查询条件
    const whereConditions: any = {};

    if (roleCode) {
      whereConditions.roleCode = Like(`%${roleCode}%`);
    }
    if (roleName) {
      whereConditions.roleName = Like(`%${roleName}%`);
    }
    if (status) {
      whereConditions.status = status;
    }

    // 获取总数
    const total = await this.entityManager.count(Role, {
      where: whereConditions,
    });

    // 获取分页数据
    const records = await this.entityManager.find(Role, {
      where: whereConditions,
      skip: (current - 1) * size,
      take: size,
      order: {
        id: 'DESC',
      },
    });

    return {
      code: '200',
      data: {
        records,
        total,
        current,
        size,
      },
      msg: '获取角色列表成功',
    };
  }

  async getAllRoles() {
    const roles = await this.entityManager.find(Role, {
      where: { status: '1' },
      select: ['id', 'roleCode', 'roleName'],
    });

    return {
      code: '200',
      data: roles,
      msg: '获取所有角色成功',
    };
  }

  async getUserList(query: UserSearchDto): Promise<UserResponseDto> {
    const {
      current,
      size,
      userName,
      nickName,
      userPhone,
      userEmail,
      userGender,
      status,
    } = query;

    // 构建查询条件
    const whereConditions: any = {};

    if (userName) {
      whereConditions.userName = Like(`%${userName}%`);
    }
    if (nickName) {
      whereConditions.nickName = Like(`%${nickName}%`);
    }
    if (userPhone) {
      whereConditions.userPhone = Like(`%${userPhone}%`);
    }
    if (userEmail) {
      whereConditions.userEmail = Like(`%${userEmail}%`);
    }
    if (userGender) {
      whereConditions.userGender = userGender;
    }
    if (status) {
      whereConditions.status = status;
    }

    // 获取总数
    const total = await this.entityManager.count(User, {
      where: whereConditions,
    });

    // 获取分页数据
    const records = await this.entityManager.find(User, {
      where: whereConditions,
      skip: (current - 1) * size,
      take: size,
      order: {
        createTime: 'DESC',
      },
      relations: ['roles'], // 如果需要加载用户关联的角色信息
    });

    return {
      code: '200',
      data: {
        records,
        total,
        current,
        size,
      },
      msg: '获取用户列表成功',
    };
  }

  // 添加用户
  async addUser(createUserDto: CreateUserDto) {
    const user = new User();
    const { roles: roleCode, ...userData } = createUserDto;
    Object.assign(user, {
      ...userData,
      status: userData.status || '1',
    });
    if (roleCode) {
      const role = await this.entityManager.findOne(Role, {
        where: { roleCode },
      });
      if (!role) {
        throw new NotFoundException(`角色代码 ${roleCode} 不存在`);
      }
      user.roles = [role];
    }
    const savedUser = await this.entityManager.save(User, user);
    // 重新查询用户以获取关联的角色信息
    const userWithRoles = await this.entityManager.findOne(User, {
      where: { id: savedUser.id },
      relations: ['roles'],
    });
    return {
      code: '200',
      data: userWithRoles,
      msg: '添加用户成功',
    };
  }

  // 更新用户
  async updateUser(updateUserDto: UpdateUserDto) {
    const { id, roles: roleCode, ...updateData } = updateUserDto;

    // 检查用户是否存在
    const user = await this.entityManager.findOne(User, {
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    // 使用update更新基本信息
    await this.entityManager.update(User, id, updateData);

    // 如果传入了角色信息，更新角色关系
    if (roleCode) {
      const role = await this.entityManager.findOne(Role, {
        where: { roleCode },
      });

      if (!role) {
        throw new NotFoundException(`角色代码 ${roleCode} 不存在`);
      }

      // 更新关联关系需要使用save
      const userToUpdate = await this.entityManager.findOne(User, {
        where: { id },
        relations: ['roles'],
      });
      userToUpdate.roles = [role];
      await this.entityManager.save(User, userToUpdate);
    }

    // 重新查询用户以获取最新的关联数据
    const updatedUser = await this.entityManager.findOne(User, {
      where: { id },
      relations: ['roles'],
    });

    return {
      code: '200',
      data: updatedUser,
      msg: '更新用户成功',
    };
  }

  // 删除用户
  async deleteUser(ids) {
    console.log(ids,'ids');
    const { id } = ids;
    const user = await this.entityManager.findOne(User, {
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    await this.entityManager.delete(User, id);

    return {
      code: '200',
      data: user,
      msg: '删除用户成功',
    };
  }

  // 添加角色
  async addRole(createRoleDto: any) {
    const role = new Role();
    Object.assign(role, createRoleDto);

    const savedRole = await this.entityManager.save(Role, role);

    return {
      code: '200',
      data: savedRole,
      msg: '添加角色成功',
    };
  }

  // 更新角色
  async updateRole(updateRoleDto: any) {
    const { id, ...updateData } = updateRoleDto;

    const role = await this.entityManager.findOne(Role, {
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`ID为${id}的角色不存在`);
    }

    await this.entityManager.update(Role, id, updateData);

    const updatedRole = await this.entityManager.findOne(Role, {
      where: { id },
    });

    return {
      code: '200',
      data: updatedRole,
      msg: '更新角色成功',
    };
  }

  // 删除角色
  async deleteRole(id: number) {
    const role = await this.entityManager.findOne(Role, {
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`ID为${id}的角色不存在`);
    }

    await this.entityManager.delete(Role, id);

    return {
      code: '200',
      data: role,
      msg: '删除角色成功',
    };
  }
}
