import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SlugService } from '../shared/slug/slug.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

const SEED_BOOKS: readonly Omit<Book, 'slug'>[] = [
  {
    id: '1',
    title: 'bebebbe',
    price: 750,
    isbn: '9780132350884',
    pageCount: 464,
    author: 'Vereshchain O.O.',
  },
  {
    id: '2',
    title: 'Potuzhno',
    price: 820,
    isbn: '9780135957059',
    pageCount: 352,
    author: 'Voloshyn T.R.',
  },
  {
    id: '3',
    title: 'bebe memebe',
    price: 900,
    isbn: '9780201633610',
    pageCount: 395,
    author: 'Neymet D.V.',
  },
];

@Injectable()
export class BooksService {
  private readonly items: Book[];

  constructor(private readonly slugService: SlugService) {
    this.items = SEED_BOOKS.map((book) => ({
      ...book,
      slug: this.slugService.generateSlug(book.title),
    }));
  }

  findAll(search?: string, limit?: number): Book[] {
    if (limit !== undefined && limit < 1) {
      throw new BadRequestException('limit must be a positive integer');
    }

    const query = search?.trim().toLowerCase();
    const result = query
      ? this.items.filter((b) => b.title.toLowerCase().includes(query))
      : this.items;

    return limit !== undefined ? result.slice(0, limit) : [...result];
  }

  findOne(id: string): Book {
    const book = this.items.find((b) => b.id === id);
    if (!book) {
      throw new NotFoundException(`book with ID ${id} not found`);
    }
    return book;
  }

  create(dto: CreateBookDto): Book {
    this.assertIsbnUnique(dto.isbn);
    const book: Book = {
      id: randomUUID(),
      ...dto,
      slug: this.slugService.generateSlug(dto.title),
    };
    this.items.push(book);
    return book;
  }

  update(id: string, dto: UpdateBookDto): Book {
    const book = this.findOne(id);
    if (dto.isbn) this.assertIsbnUnique(dto.isbn, id);
    const patch = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value != null),
    );
    Object.assign(book, patch);
    if (dto.title) book.slug = this.slugService.generateSlug(dto.title);
    return book;
  }

  remove(id: string): void {
    const index = this.items.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new NotFoundException(`book with ID ${id} not found`);
    }
    this.items.splice(index, 1);
  }

  private normalizeIsbn(isbn: string): string {
    return isbn.replace(/[-\s]/g, '').toUpperCase();
  }

  private assertIsbnUnique(isbn: string, excludeId?: string): void {
    const target = this.normalizeIsbn(isbn);
    const taken = this.items.some(
      (b) => b.id !== excludeId && this.normalizeIsbn(b.isbn) === target,
    );
    if (taken) {
      throw new ConflictException(`book with ISBN ${isbn} already exists`);
    }
  }
}