import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  async sitemap(@Res({ passthrough: true }) res: Response): Promise<string> {
    const { xml, maxAgeSec } = await this.sitemapService.getSitemapResponse();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      `public, max-age=${maxAgeSec}, s-maxage=${maxAgeSec}`,
    );
    return xml;
  }

  @Get('robots.txt')
  robots(@Res({ passthrough: true }) res: Response): string {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return this.sitemapService.getRobotsTxt();
  }
}
