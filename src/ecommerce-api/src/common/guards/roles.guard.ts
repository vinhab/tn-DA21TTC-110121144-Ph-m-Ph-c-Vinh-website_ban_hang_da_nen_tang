import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Nếu không có yêu cầu role cụ thể => cho phép
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('✅ [RolesGuard] user:', user);
    console.log('✅ [RolesGuard] requiredRoles:', requiredRoles);

    if (!user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
