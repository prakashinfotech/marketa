import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.modules.categories.model import Category, CategoryAttribute
from app.modules.categories import schema

_logger = logging.getLogger(__name__)

class CategoryCRUD:
    def get_all_categories(self, db: Session):
        try:
            # Only top level categories for the tree
            categories = db.query(Category).filter(Category.parent_id == None).order_by(Category.display_order).all()
            
            # Recursive function to build the tree
            def build_tree(cat):
                return {
                    "id": cat.id,
                    "name": cat.name,
                    "slug": cat.slug,
                    "icon_url": cat.icon_url,
                    "children": [build_tree(child) for child in cat.children] if cat.children else []
                }

            data = [build_tree(cat) for cat in categories]
            return {"success": True, "msg": "Categories fetched.", "data": data}
        except SQLAlchemyError as e:
            _logger.error(f"Error fetching categories: {e}")
            return {"success": False, "msg": "Database error.", "data": []}

    def get_category_attributes(self, db: Session, category_id: int):
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
        try:
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
            return {"success": True, "msg": "Category created.", "data": {"id": category.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating category: {e}")
            return {"success": False, "msg": "Database error or duplicate.", "data": None}

    def create_attribute(self, db: Session, payload: schema.CategoryAttributeCreate):
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
            return {"success": True, "msg": "Attribute created.", "data": {"id": attr.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error(f"Error creating attribute: {e}")
            return {"success": False, "msg": "Database error.", "data": None}

category = CategoryCRUD()
