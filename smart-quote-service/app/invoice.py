from pathlib import Path

def render_invoice(invoice_json: dict, out_pdf_path: str, out_html_path: str) -> str:
    html = f"""<!doctype html>
<html><head><meta charset='utf-8'><title>Invoice</title>
<style>
body {{ font-family: Arial, sans-serif; margin: 24px; }}
h1 {{ margin: 0 0 8px 0; }}
.table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
.table th, .table td {{ border: 1px solid #ccc; padding: 8px; text-align: left; }}
.right {{ text-align: right; }}
.small {{ color: #555; font-size: 12px; }}
</style>
</head><body>
<h1>Invoice</h1>
<div class='small'>Invoice No: {invoice_json.get('invoice_no','')}</div>
<div class='small'>Bill To: {invoice_json.get('bill_to','')}</div>
<div class='small'>Ship To: {invoice_json.get('ship_to','')}</div>
<table class='table'>
<thead><tr><th>SKU</th><th>Description</th><th>Qty</th><th>Unit Price (₹)</th><th class='right'>Line Total (₹)</th></tr></thead>
<tbody>
{''.join([f"<tr><td>{it.get('sku','')}</td><td>{it.get('desc','')}</td><td>{it.get('qty',0)}</td><td>{it.get('unit_price',0):,.2f}</td><td class='right'>{it.get('line_total',0):,.2f}</td></tr>" for it in invoice_json.get('items',[])])}
</tbody></table>
<p class='right'>Freight: ₹{invoice_json.get('freight',0):,.2f}</p>
<p class='right'>Taxes: ₹{invoice_json.get('taxes',0):,.2f}</p>
<h3 class='right'>Grand Total: ₹{invoice_json.get('grand_total',0):,.2f}</h3>
<p>Estimated Delivery Date: {invoice_json.get('estimated_delivery_date','')}</p>
<p>Payment Terms: {invoice_json.get('payment_terms','')}</p>
<p>Notes: {invoice_json.get('notes','')}</p>
</body></html>"""
    Path(out_html_path).write_text(html, encoding="utf-8")
    try:
        from weasyprint import HTML
        HTML(string=html).write_pdf(out_pdf_path)
        return out_pdf_path
    except Exception:
        return out_html_path
