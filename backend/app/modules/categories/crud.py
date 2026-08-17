import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.modules.categories.model import Category, CategoryAttribute
from app.modules.categories import schema

_logger = logging.getLogger(__name__)

class CategoryCRUD:
    def get_all_categories(self, db: Session):
        _logger.info("Fetching all categories (tree structure)")
        try:
            # Only top level categories for the tree, excluding deleted ones
            categories = db.query(Category).filter(
                Category.parent_id == None,
                Category.is_delete.isnot(True)
            ).order_by(Category.display_order).all()
            
            # Recursive function to build the tree
            def build_tree(cat):
                return {
                    "id": cat.id,
                    "name": cat.name,
                    "slug": cat.slug,
                    "icon_url": cat.icon_url,
                    "children": [build_tree(child) for child in cat.children if not child.is_delete] if cat.children else []
                }

            data = [build_tree(cat) for cat in categories]
            return {"success": True, "msg": "Categories fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching categories: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def get_category_attributes(self, db: Session, category_id: int):
        _logger.info(f"Fetching attributes for category_id={category_id}")
        try:
            attrs = db.query(CategoryAttribute).filter(CategoryAttribute.category_id == category_id).order_by(CategoryAttribute.display_order).all()
            data = [{
                "id": a.id,
                "name": a.name,
                "slug": a.slug,
                "field_type": a.field_type,
                "options": a.options,
                "is_required": a.is_required
            } for a in attrs]
            return {"success": True, "msg": "Attributes fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching attributes for category {category_id}: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def create_category(self, db: Session, payload: schema.CategoryCreate):
        _logger.info(f"Creating category: {payload.name}")
        try:
            # Check if category with this slug already exists (including soft-deleted)
            existing = db.query(Category).filter(Category.slug == payload.slug).first()
            if existing:
                if existing.is_delete:
                    # Restore soft-deleted category
                    _logger.info(f"Restoring soft-deleted category with slug '{payload.slug}'")
                    existing.is_delete = False
                    existing.deleted_at = None
                    existing.name = payload.name
                    existing.parent_id = payload.parent_id
                    existing.icon_url = payload.icon_url
                    existing.description = payload.description
                    existing.display_order = payload.display_order
                    existing.is_active = payload.is_active
                    db.commit()
                    db.refresh(existing)
                    return {"success": True, "msg": "Category restored from trash.", "data": {"id": existing.id}}
                else:
                    return {"success": False, "msg": "A category with this slug already exists.", "data": None}

            category = Category(
                name=payload.name,
                slug=payload.slug,
                parent_id=payload.parent_id,
                icon_url=payload.icon_url,
                description=payload.description,
                display_order=payload.display_order,
                is_active=payload.is_active
            )
            db.add(category)
            db.commit()
            db.refresh(category)
            _logger.info(f"Category created successfully: id={category.id}, name={category.name}")
            return {"success": True, "msg": "Category created.", "data": {"id": category.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating category: {e}")
            return {"success": False, "msg": "Database error or duplicate slug.", "data": None}

    def create_attribute(self, db: Session, payload: schema.CategoryAttributeCreate):
        _logger.info(f"Creating attribute '{payload.name}' for category_id={payload.category_id}")
        try:
            attr = CategoryAttribute(
                category_id=payload.category_id,
                name=payload.name,
                slug=payload.slug,
                field_type=payload.field_type,
                options=payload.options,
                is_required=payload.is_required,
                display_order=payload.display_order
            )
            db.add(attr)
            db.commit()
            db.refresh(attr)
            _logger.info(f"Attribute created successfully: id={attr.id}, name={attr.name}")
            return {"success": True, "msg": "Attribute created.", "data": {"id": attr.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating attribute: {e}")
            return {"success": False, "msg": "Database error.", "data": None}

    def update_category(self, db: Session, category_id: int, payload: schema.CategoryUpdate):
        _logger.info(f"Updating category_id={category_id}")
        try:
            category = db.query(Category).filter(Category.id == category_id, Category.is_delete.isnot(True)).first()
            if not category:
                return {"success": False, "msg": "Category not found.", "data": None}
            
            update_data = payload.dict(exclude_unset=True)
            
            # Check for slug uniqueness if it's being changed
            if 'slug' in update_data and update_data['slug'] != category.slug:
                existing = db.query(Category).filter(Category.slug == update_data['slug']).first()
                if existing:
                    return {"success": False, "msg": "A category with this slug already exists.", "data": None}

            for key, value in update_data.items():
                setattr(category, key, value)
            
            db.commit()
            db.refresh(category)
            _logger.info(f"Category updated successfully: id={category.id}")
            return {"success": True, "msg": "Category updated.", "data": {"id": category.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error updating category: {e}")
            return {"success": False, "msg": "Database error or duplicate slug.", "data": None}

    def delete_category(self, db: Session, category_id: int):
        _logger.info(f"Deleting category_id={category_id}")
        try:
            category = db.query(Category).filter(Category.id == category_id, Category.is_delete.isnot(True)).first()
            if not category:
                return {"success": False, "msg": "Category not found.", "data": None}
            
            # Soft delete
            from datetime import datetime, timezone
            category.is_delete = True
            category.deleted_at = datetime.now(timezone.utc)
            
            db.commit()
            _logger.info(f"Category soft-deleted: id={category_id}")
            return {"success": True, "msg": "Category deleted.", "data": None}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error deleting category: {e}")
            return {"success": False, "msg": "Database error.", "data": None}

    def update_attribute(self, db: Session, attribute_id: int, payload: schema.CategoryAttributeUpdate):
        _logger.info(f"Updating attribute_id={attribute_id}")
        try:
            attr = db.query(CategoryAttribute).filter(CategoryAttribute.id == attribute_id, CategoryAttribute.is_delete.isnot(True)).first()
            if not attr:
                return {"success": False, "msg": "Attribute not found.", "data": None}
            
            update_data = payload.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(attr, key, value)
            
            db.commit()
            db.refresh(attr)
            _logger.info(f"Attribute updated successfully: id={attr.id}")
            return {"success": True, "msg": "Attribute updated.", "data": {"id": attr.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error updating attribute: {e}")
            return {"success": False, "msg": "Database error.", "data": None}

    def delete_attribute(self, db: Session, attribute_id: int):
        _logger.info(f"Deleting attribute_id={attribute_id}")
        try:
            attr = db.query(CategoryAttribute).filter(CategoryAttribute.id == attribute_id, CategoryAttribute.is_delete.isnot(True)).first()
            if not attr:
                return {"success": False, "msg": "Attribute not found.", "data": None}
            
            # Soft delete
            from datetime import datetime, timezone
            attr.is_delete = True
            attr.deleted_at = datetime.now(timezone.utc)
            
            db.commit()
            _logger.info(f"Attribute soft-deleted: id={attribute_id}")
            return {"success": True, "msg": "Attribute deleted.", "data": None}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error deleting attribute: {e}")
            return {"success": False, "msg": "Database error.", "data": None}

category = CategoryCRUD()
