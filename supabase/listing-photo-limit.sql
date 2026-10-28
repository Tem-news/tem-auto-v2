ALTER TABLE public.cars ADD CONSTRAINT cars_images_max_15 CHECK (coalesce(cardinality(images), 0) <= 15);
