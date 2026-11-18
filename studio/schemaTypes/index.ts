import { album } from './album';
import { category } from './category';
import { film } from './film';
import { photo } from './photo';
import { about, heroSlide, siteSettings } from './singletons';
import { species } from './species';
import { photoPair, story, video } from './story';

export const schemaTypes = [siteSettings, about, category, album, film, story, species, photo, photoPair, video, heroSlide];

export const SINGLETONS = ['siteSettings', 'about'];
