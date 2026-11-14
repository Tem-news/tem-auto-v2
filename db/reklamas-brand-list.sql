alter table public.temauto_ads drop constraint temauto_ads_slot_check;
alter table public.temauto_ads add constraint temauto_ads_slot_check check (slot in ('desktop_1','desktop_2','desktop_form_1','desktop_form_2','desktop_login','desktop_form_left_1','desktop_form_left_2','mobile_menu','mobile_list','mobile_brands','mobile_brand_list'));
